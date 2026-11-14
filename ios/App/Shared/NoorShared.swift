import Foundation
#if canImport(ActivityKit)
import ActivityKit
#endif

/// Données partagées entre l'app et les widgets (App Group).
/// L'app web écrit ces valeurs via NoorBridgePlugin ; les widgets les lisent ici.
enum NoorShared {
    static let group = "group.com.hormend.noor"

    static var defaults: UserDefaults { UserDefaults(suiteName: group) ?? .standard }

    static func string(_ key: String) -> String { defaults.string(forKey: key) ?? "" }

    static var lang: String {
        let stored = string("lang")
        if stored == "fr" || stored == "en" { return stored }
        return (Locale.preferredLanguages.first ?? "fr").hasPrefix("fr") ? "fr" : "en"
    }

    static var verseEvery: String { string("verseEvery") == "day" ? "day" : "hour" }

    static func dayKey(_ date: Date) -> String {
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = .current
        let c = cal.dateComponents([.year, .month, .day], from: date)
        return String(format: "%04d-%02d-%02d", c.year ?? 0, c.month ?? 0, c.day ?? 0)
    }

    /// Petit raccourci bilingue.
    static func L(_ fr: String, _ en: String) -> String { lang == "fr" ? fr : en }
}

// MARK: - Versets

struct NoorVerse: Decodable {
    let s: Int
    let a: Int
    let ar: String
    let fr: String
    let en: String
    let name: String

    var reference: String { "\(name) \(s):\(a)" }
    func text(_ lang: String) -> String { lang == "fr" ? fr : en }
}

enum NoorVerses {
    static let all: [NoorVerse] = {
        guard let url = Bundle.main.url(forResource: "verses", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let list = try? JSONDecoder().decode([NoorVerse].self, from: data) else { return [] }
        return list
    }()

    /// Même formule que src/lib/verses.js : l'app et le widget affichent le même verset.
    static func index(at date: Date, every: String) -> Int {
        let n = all.count
        guard n > 0 else { return 0 }
        let t = Int(date.timeIntervalSince1970.rounded(.down))
        let slot: Int
        if every == "day" {
            let local = Double(t + TimeZone.current.secondsFromGMT(for: date))
            slot = Int((local / 86400).rounded(.down))
        } else {
            slot = Int((Double(t) / 3600).rounded(.down))
        }
        return ((slot * 37 + 11) % n + n) % n
    }

    static func verse(at date: Date, every: String) -> NoorVerse? {
        all.isEmpty ? nil : all[index(at: date, every: every)]
    }
}

// MARK: - Prières

struct NoorPrayerDay: Decodable {
    let d: String
    let t: [Double]
}

struct NoorSchedule: Decodable {
    let city: String
    let days: [NoorPrayerDay]
}

struct NoorPrayer: Hashable {
    let key: String
    let date: Date
}

enum NoorPrayers {
    static let keys = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"]

    static func schedule() -> NoorSchedule? {
        guard let data = NoorShared.string("prayers").data(using: .utf8), !data.isEmpty else { return nil }
        return try? JSONDecoder().decode(NoorSchedule.self, from: data)
    }

    private static func prayers(_ day: NoorPrayerDay) -> [NoorPrayer] {
        zip(keys, day.t).map { NoorPrayer(key: $0, date: Date(timeIntervalSince1970: $1)) }
    }

    /// Les 5 prières du jour (sans le lever du soleil).
    static func day(_ date: Date, in schedule: NoorSchedule) -> [NoorPrayer] {
        let key = NoorShared.dayKey(date)
        guard let day = schedule.days.first(where: { $0.d == key }) else { return [] }
        return prayers(day).filter { $0.key != "sunrise" }
    }

    /// Toutes les prières à venir, dans l'ordre.
    static func upcoming(after date: Date, in schedule: NoorSchedule) -> [NoorPrayer] {
        schedule.days.flatMap { prayers($0) }
            .filter { $0.key != "sunrise" && $0.date > date }
            .sorted { $0.date < $1.date }
    }

    static func name(_ key: String, lang: String) -> String {
        switch key {
        case "fajr": return "Fajr"
        case "sunrise": return lang == "fr" ? "Chourouq" : "Sunrise"
        case "dhuhr": return "Dhuhr"
        case "asr": return "Asr"
        case "maghrib": return "Maghrib"
        case "isha": return lang == "fr" ? "Icha" : "Isha"
        default: return key
        }
    }
}

// MARK: - Dhikr

struct NoorDhikrItem {
    let ar: String
    let tr: String
    let target: Int
}

enum NoorDhikr {
    /// Même ordre que src/lib/dhikr.js.
    static let items: [NoorDhikrItem] = [
        NoorDhikrItem(ar: "سُبْحَانَ ٱللَّٰهِ", tr: "Subhan Allah", target: 33),
        NoorDhikrItem(ar: "ٱلْحَمْدُ لِلَّٰهِ", tr: "Alhamdulillah", target: 33),
        NoorDhikrItem(ar: "ٱللَّٰهُ أَكْبَرُ", tr: "Allahu Akbar", target: 34),
        NoorDhikrItem(ar: "أَسْتَغْفِرُ ٱللَّٰهَ", tr: "Astaghfirullah", target: 100),
        NoorDhikrItem(ar: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ", tr: "La ilaha illa Allah", target: 100),
    ]

    static var current: NoorDhikrItem {
        let i = Int(NoorShared.string("dhikrIdx")) ?? 0
        return items.indices.contains(i) ? items[i] : items[0]
    }

    /// Le compteur repart de zéro chaque jour.
    static func count(on date: Date = Date()) -> Int {
        guard NoorShared.string("dhikrDay") == NoorShared.dayKey(date) else { return 0 }
        return Int(NoorShared.string("dhikrCount")) ?? 0
    }

    static func increment() {
        let now = Date()
        let d = NoorShared.defaults
        d.set(String(count(on: now) + 1), forKey: "dhikrCount")
        d.set(NoorShared.dayKey(now), forKey: "dhikrDay")
    }
}

// MARK: - Calendrier hégirien

struct NoorHijri {
    let day: Int
    let month: Int
    let year: Int

    private static let fr = ["Mouharram", "Safar", "Rabi al-Awwal", "Rabi ath-Thani", "Joumada al-Oula", "Joumada ath-Thania", "Rajab", "Chaabane", "Ramadan", "Chawwal", "Dhou al-Qida", "Dhou al-Hijja"]
    private static let en = ["Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani", "Jumada al-Ula", "Jumada al-Thani", "Rajab", "Shaban", "Ramadan", "Shawwal", "Dhu al-Qadah", "Dhu al-Hijjah"]

    init(_ date: Date) {
        let adjust = Int(NoorShared.string("hijriAdjust")) ?? 0
        var cal = Calendar(identifier: .islamicUmmAlQura)
        cal.timeZone = .current
        let shifted = Calendar.current.date(byAdding: .day, value: adjust, to: date) ?? date
        let c = cal.dateComponents([.day, .month, .year], from: shifted)
        day = c.day ?? 1
        month = c.month ?? 1
        year = c.year ?? 0
    }

    func monthName(_ lang: String) -> String {
        let list = lang == "fr" ? NoorHijri.fr : NoorHijri.en
        return list.indices.contains(month - 1) ? list[month - 1] : ""
    }
}

// MARK: - Live Activity (Dynamic Island)

#if canImport(ActivityKit)
struct PrayerActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var name: String
        var at: Date
    }

    var city: String
    var lang: String
}
#endif

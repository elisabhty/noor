import SwiftUI
import WidgetKit

struct VerseEntry: TimelineEntry {
    let date: Date
    let verse: NoorVerse?
    let lang: String
}

struct VerseProvider: TimelineProvider {
    private func entry(at date: Date) -> VerseEntry {
        VerseEntry(date: date, verse: NoorVerses.verse(at: date, every: NoorShared.verseEvery), lang: NoorShared.lang)
    }

    func placeholder(in context: Context) -> VerseEntry { entry(at: Date()) }

    func getSnapshot(in context: Context, completion: @escaping (VerseEntry) -> Void) {
        completion(entry(at: Date()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<VerseEntry>) -> Void) {
        let now = Date()
        var entries = [entry(at: now)]
        if NoorShared.verseEvery == "day" {
            let start = Calendar.current.startOfDay(for: now)
            for i in 1...3 {
                if let day = Calendar.current.date(byAdding: .day, value: i, to: start) { entries.append(entry(at: day)) }
            }
        } else {
            let hour = Date(timeIntervalSince1970: (now.timeIntervalSince1970 / 3600).rounded(.down) * 3600)
            for i in 1...24 { entries.append(entry(at: hour.addingTimeInterval(Double(i) * 3600))) }
        }
        completion(Timeline(entries: entries, policy: .atEnd))
    }
}

struct VerseWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: VerseEntry

    var body: some View {
        Group {
            if let verse = entry.verse {
                switch family {
                case .accessoryRectangular: lockScreen(verse)
                case .systemSmall: small(verse)
                case .systemLarge: large(verse)
                default: medium(verse)
                }
            } else {
                NoorEmptyView(text: NoorShared.L("Ouvre Noor pour commencer", "Open Noor to get started"))
            }
        }
        .widgetURL(URL(string: "noor://today"))
    }

    private func footer(_ verse: NoorVerse, mark: CGFloat = 22) -> some View {
        HStack {
            Text(verse.reference)
                .font(.caption2.weight(.semibold))
                .foregroundStyle(NoorTheme.gold)
                .lineLimit(1)
            Spacer()
            NoorMark(height: mark)
        }
    }

    private func arabic(_ verse: NoorVerse, size: CGFloat, lines: Int?) -> some View {
        Text(verse.ar)
            .font(NoorTheme.arabic(size))
            .foregroundStyle(NoorTheme.cream)
            .multilineTextAlignment(.trailing)
            .lineLimit(lines)
            .minimumScaleFactor(0.6)
            .frame(maxWidth: .infinity, alignment: .trailing)
    }

    private func small(_ verse: NoorVerse) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(verse.text(entry.lang))
                .font(.system(size: 14, weight: .medium, design: .rounded))
                .foregroundStyle(NoorTheme.cream)
                .minimumScaleFactor(0.6)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            footer(verse, mark: 20)
        }
    }

    private func medium(_ verse: NoorVerse) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            arabic(verse, size: 19, lines: 2)
            Text(verse.text(entry.lang))
                .font(.system(size: 13, weight: .medium, design: .rounded))
                .foregroundStyle(NoorTheme.cream.opacity(0.9))
                .lineLimit(3)
                .minimumScaleFactor(0.7)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            footer(verse)
        }
    }

    private func large(_ verse: NoorVerse) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(NoorShared.L(NoorShared.verseEvery == "day" ? "VERSET DU JOUR" : "VERSET DE L’HEURE",
                              NoorShared.verseEvery == "day" ? "VERSE OF THE DAY" : "VERSE OF THE HOUR"))
                .font(.caption2.weight(.bold))
                .foregroundStyle(NoorTheme.gold)
            arabic(verse, size: 26, lines: nil)
            Text(verse.text(entry.lang))
                .font(.system(size: 16, weight: .medium, design: .rounded))
                .foregroundStyle(NoorTheme.cream.opacity(0.9))
                .minimumScaleFactor(0.6)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            footer(verse, mark: 30)
        }
    }

    private func lockScreen(_ verse: NoorVerse) -> some View {
        VStack(alignment: .leading, spacing: 1) {
            Text(verse.text(entry.lang))
                .font(.system(size: 12, weight: .medium, design: .rounded))
                .lineLimit(3)
                .minimumScaleFactor(0.8)
            Text(verse.reference)
                .font(.system(size: 10, weight: .semibold))
                .opacity(0.7)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct VerseWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "NoorVerse", provider: VerseProvider()) { entry in
            VerseWidgetView(entry: entry).noorBackground()
        }
        .configurationDisplayName(NoorShared.L("Verset", "Verse"))
        .description(NoorShared.L("Un verset du Coran, renouvelé chaque heure ou chaque jour.", "A verse of the Quran, renewed every hour or every day."))
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryRectangular])
    }
}

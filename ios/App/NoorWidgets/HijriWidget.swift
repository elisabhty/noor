import SwiftUI
import WidgetKit

struct HijriEntry: TimelineEntry {
    let date: Date
    let hijri: NoorHijri
    let lang: String
}

struct HijriProvider: TimelineProvider {
    private func entry(at date: Date) -> HijriEntry {
        HijriEntry(date: date, hijri: NoorHijri(date), lang: NoorShared.lang)
    }

    func placeholder(in context: Context) -> HijriEntry { entry(at: Date()) }

    func getSnapshot(in context: Context, completion: @escaping (HijriEntry) -> Void) {
        completion(entry(at: Date()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<HijriEntry>) -> Void) {
        let now = Date()
        var entries = [entry(at: now)]
        let start = Calendar.current.startOfDay(for: now)
        for i in 1...7 {
            // Une minute après minuit, pour être sûr d'être dans le bon jour.
            if let day = Calendar.current.date(byAdding: .day, value: i, to: start) {
                entries.append(entry(at: day.addingTimeInterval(60)))
            }
        }
        completion(Timeline(entries: entries, policy: .atEnd))
    }
}

struct HijriWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: HijriEntry

    private var label: String { "\(entry.hijri.day) \(entry.hijri.monthName(entry.lang)) \(entry.hijri.year)" }

    var body: some View {
        switch family {
        case .accessoryInline:
            Text(label)
        case .accessoryCircular:
            ZStack {
                AccessoryWidgetBackground()
                VStack(spacing: 0) {
                    Text("\(entry.hijri.day)").font(.system(size: 20, weight: .bold, design: .rounded))
                    Text(entry.hijri.monthName(entry.lang)).font(.system(size: 8, weight: .semibold)).lineLimit(1).minimumScaleFactor(0.5)
                }
                .padding(4)
            }
        default:
            VStack(spacing: 2) {
                HStack {
                    Spacer()
                    NoorMark(height: 24, mood: NoorMood.forTime(entry.date))
                }
                Text("\(entry.hijri.day)")
                    .font(.system(size: 46, weight: .bold, design: .rounded))
                    .foregroundStyle(NoorTheme.gold)
                Text(entry.hijri.monthName(entry.lang))
                    .font(.system(size: 15, weight: .semibold, design: .rounded))
                    .foregroundStyle(NoorTheme.cream)
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)
                Text(String(entry.hijri.year))
                    .font(.system(size: 13, weight: .medium, design: .rounded))
                    .foregroundStyle(NoorTheme.mute)
                Spacer(minLength: 0)
            }
        }
    }
}

struct HijriWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "NoorHijri", provider: HijriProvider()) { entry in
            HijriWidgetView(entry: entry).noorBackground()
        }
        .configurationDisplayName(NoorShared.L("Date hégirienne", "Hijri date"))
        .description(NoorShared.L("La date du calendrier musulman.", "Today’s date in the Islamic calendar."))
        .supportedFamilies([.systemSmall, .accessoryInline, .accessoryCircular])
    }
}

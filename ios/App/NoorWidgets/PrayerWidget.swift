import SwiftUI
import WidgetKit

struct PrayerEntry: TimelineEntry {
    let date: Date
    let next: NoorPrayer?
    let today: [NoorPrayer]
    let city: String
    let lang: String
}

struct PrayerProvider: TimelineProvider {
    private func entry(at date: Date, schedule: NoorSchedule?) -> PrayerEntry {
        guard let schedule else {
            return PrayerEntry(date: date, next: nil, today: [], city: "", lang: NoorShared.lang)
        }
        return PrayerEntry(
            date: date,
            next: NoorPrayers.upcoming(after: date, in: schedule).first,
            today: NoorPrayers.day(date, in: schedule),
            city: schedule.city,
            lang: NoorShared.lang
        )
    }

    func placeholder(in context: Context) -> PrayerEntry { entry(at: Date(), schedule: NoorPrayers.schedule()) }

    func getSnapshot(in context: Context, completion: @escaping (PrayerEntry) -> Void) {
        completion(entry(at: Date(), schedule: NoorPrayers.schedule()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerEntry>) -> Void) {
        let now = Date()
        let schedule = NoorPrayers.schedule()
        var entries = [entry(at: now, schedule: schedule)]
        if let schedule {
            // Une entrée juste après chaque prière (la « prochaine » change) et à chaque minuit (la liste du jour change).
            var moments = NoorPrayers.upcoming(after: now, in: schedule).prefix(12).map { $0.date.addingTimeInterval(1) }
            let start = Calendar.current.startOfDay(for: now)
            for i in 1...2 {
                if let day = Calendar.current.date(byAdding: .day, value: i, to: start) { moments.append(day) }
            }
            for moment in moments.sorted() { entries.append(entry(at: moment, schedule: schedule)) }
        }
        completion(Timeline(entries: entries, policy: .atEnd))
    }
}

struct PrayerWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: PrayerEntry

    var body: some View {
        Group {
            if let next = entry.next {
                switch family {
                case .accessoryInline: inline(next)
                case .accessoryCircular: circular(next)
                case .accessoryRectangular: rectangular(next)
                case .systemMedium: medium(next)
                default: small(next)
                }
            } else if family == .accessoryInline {
                Text(NoorShared.L("Ouvre Noor", "Open Noor"))
            } else if family == .accessoryCircular || family == .accessoryRectangular {
                Text(NoorShared.L("Ouvre Noor", "Open Noor")).font(.caption2)
            } else {
                NoorEmptyView(text: NoorShared.L("Ouvre Noor pour choisir ta ville", "Open Noor to choose your city"))
            }
        }
        .widgetURL(URL(string: "noor://prayers"))
    }

    private func name(_ prayer: NoorPrayer) -> String { NoorPrayers.name(prayer.key, lang: entry.lang) }

    private func small(_ next: NoorPrayer) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack(alignment: .top) {
                Text(NoorShared.L("PROCHAINE PRIÈRE", "NEXT PRAYER"))
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(NoorTheme.leaf)
                Spacer()
                NoorMark(height: 28, mood: .calm)
            }
            Spacer(minLength: 0)
            Text(name(next))
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundStyle(NoorTheme.cream)
            Text(next.date, style: .time)
                .font(.system(size: 20, weight: .bold, design: .rounded))
                .foregroundStyle(NoorTheme.gold)
            Text(next.date, style: .timer)
                .font(.system(size: 13, weight: .medium, design: .rounded))
                .monospacedDigit()
                .foregroundStyle(NoorTheme.mute)
        }
    }

    private func medium(_ next: NoorPrayer) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(entry.city)
                    .font(.system(size: 14, weight: .bold, design: .rounded))
                    .foregroundStyle(NoorTheme.cream)
                Spacer()
                Text(next.date, style: .timer)
                    .font(.system(size: 13, weight: .semibold, design: .rounded))
                    .monospacedDigit()
                    .multilineTextAlignment(.trailing)
                    .foregroundStyle(NoorTheme.leaf)
                    .frame(maxWidth: 80, alignment: .trailing)
                NoorMark(height: 26, mood: .calm)
            }
            Spacer(minLength: 0)
            HStack(spacing: 4) {
                ForEach(entry.today, id: \.self) { prayer in
                    let isNext = prayer == next
                    VStack(spacing: 4) {
                        Text(name(prayer))
                            .font(.system(size: 11, weight: .semibold, design: .rounded))
                            .foregroundStyle(isNext ? NoorTheme.night : NoorTheme.mute)
                        Text(prayer.date, style: .time)
                            .font(.system(size: 13, weight: .bold, design: .rounded))
                            .foregroundStyle(isNext ? NoorTheme.night : NoorTheme.cream)
                            .lineLimit(1)
                            .minimumScaleFactor(0.6)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                    .background(isNext ? NoorTheme.gold : Color.clear, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                }
            }
        }
    }

    private func rectangular(_ next: NoorPrayer) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(name(next)).font(.headline)
            Text(next.date, style: .time).font(.subheadline)
            Text(next.date, style: .timer).font(.caption).monospacedDigit().opacity(0.7)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func circular(_ next: NoorPrayer) -> some View {
        ZStack {
            AccessoryWidgetBackground()
            VStack(spacing: 0) {
                Text(name(next)).font(.system(size: 10, weight: .semibold)).minimumScaleFactor(0.6).lineLimit(1)
                Text(next.date, style: .time).font(.system(size: 12, weight: .bold)).minimumScaleFactor(0.6).lineLimit(1)
            }
            .padding(4)
        }
    }

    private func inline(_ next: NoorPrayer) -> some View {
        Text("\(name(next)) \(next.date.formatted(date: .omitted, time: .shortened))")
    }
}

struct PrayerWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "NoorPrayer", provider: PrayerProvider()) { entry in
            PrayerWidgetView(entry: entry).noorBackground()
        }
        .configurationDisplayName(NoorShared.L("Heures de prière", "Prayer times"))
        .description(NoorShared.L("La prochaine prière et son compte à rebours.", "The next prayer and its countdown."))
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryInline, .accessoryCircular, .accessoryRectangular])
    }
}

import AppIntents
import SwiftUI
import WidgetKit

/// Bouton « +1 » du widget : compte sans ouvrir l'app (iOS 17+).
struct DhikrIncrementIntent: AppIntent {
    static var title: LocalizedStringResource = "Dhikr +1"
    static var isDiscoverable: Bool = false

    func perform() async throws -> some IntentResult {
        NoorDhikr.increment()
        return .result()
    }
}

struct DhikrEntry: TimelineEntry {
    let date: Date
    let item: NoorDhikrItem
    let count: Int
}

struct DhikrProvider: TimelineProvider {
    private func entry(at date: Date) -> DhikrEntry {
        DhikrEntry(date: date, item: NoorDhikr.current, count: NoorDhikr.count(on: date))
    }

    func placeholder(in context: Context) -> DhikrEntry { entry(at: Date()) }

    func getSnapshot(in context: Context, completion: @escaping (DhikrEntry) -> Void) {
        completion(entry(at: Date()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<DhikrEntry>) -> Void) {
        let now = Date()
        var entries = [entry(at: now)]
        // À minuit, le compteur du jour repart de zéro.
        let start = Calendar.current.startOfDay(for: now)
        if let midnight = Calendar.current.date(byAdding: .day, value: 1, to: start) {
            entries.append(entry(at: midnight))
        }
        completion(Timeline(entries: entries, policy: .atEnd))
    }
}

struct DhikrWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: DhikrEntry

    private var done: Bool { entry.count >= entry.item.target }

    private var counter: some View {
        HStack(alignment: .firstTextBaseline, spacing: 3) {
            Text("\(entry.count)")
                .font(.system(size: 36, weight: .bold, design: .rounded))
                .monospacedDigit()
                .foregroundStyle(done ? NoorTheme.leaf : NoorTheme.cream)
                .contentTransition(.numericText())
            Text("/ \(entry.item.target)")
                .font(.system(size: 13, weight: .medium, design: .rounded))
                .foregroundStyle(NoorTheme.mute)
        }
    }

    private var plus: some View {
        Button(intent: DhikrIncrementIntent()) {
            Text("+1")
                .font(.system(size: 16, weight: .bold, design: .rounded))
                .foregroundStyle(NoorTheme.night)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 7)
                .background(NoorTheme.gold, in: Capsule())
        }
        .buttonStyle(.plain)
    }

    private var phrase: some View {
        Text(entry.item.ar)
            .font(NoorTheme.arabic(18))
            .foregroundStyle(NoorTheme.cream)
            .lineLimit(1)
            .minimumScaleFactor(0.6)
    }

    var body: some View {
        if family == .systemMedium {
            HStack(spacing: 14) {
                VStack(alignment: .leading, spacing: 4) {
                    phrase
                    Text(entry.item.tr)
                        .font(.system(size: 13, weight: .medium, design: .rounded))
                        .foregroundStyle(NoorTheme.mute)
                    Spacer(minLength: 0)
                    counter
                }
                Spacer(minLength: 0)
                VStack(spacing: 10) {
                    NoorMark(height: 54)
                    plus.frame(width: 96)
                }
            }
        } else {
            VStack(spacing: 4) {
                phrase
                Spacer(minLength: 0)
                counter
                Spacer(minLength: 0)
                plus
            }
        }
    }
}

struct DhikrWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "NoorDhikr", provider: DhikrProvider()) { entry in
            DhikrWidgetView(entry: entry).noorBackground()
        }
        .configurationDisplayName("Dhikr")
        .description(NoorShared.L("Compte ton dhikr depuis l’écran d’accueil.", "Count your dhikr from the Home Screen."))
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

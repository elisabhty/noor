import ActivityKit
import SwiftUI
import WidgetKit

/// Compte à rebours de la prochaine prière : Dynamic Island + écran verrouillé.
struct PrayerLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: PrayerActivityAttributes.self) { context in
            HStack(spacing: 14) {
                NoorMark(height: 48, mood: .calm)
                VStack(alignment: .leading, spacing: 2) {
                    Text(context.attributes.lang == "fr" ? "PROCHAINE PRIÈRE" : "NEXT PRAYER")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(NoorTheme.leaf)
                    Text(context.state.name)
                        .font(.system(size: 22, weight: .bold, design: .rounded))
                        .foregroundStyle(NoorTheme.cream)
                    Text(context.attributes.city)
                        .font(.caption)
                        .foregroundStyle(NoorTheme.mute)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    Text(context.state.at, style: .time)
                        .font(.system(size: 20, weight: .bold, design: .rounded))
                        .foregroundStyle(NoorTheme.gold)
                    PrayerCountdown(at: context.state.at, lang: context.attributes.lang, stale: context.isStale)
                        .font(.system(size: 14, weight: .semibold, design: .rounded))
                        .foregroundStyle(NoorTheme.cream)
                        .frame(maxWidth: 110, alignment: .trailing)
                }
            }
            .padding(16)
            .activityBackgroundTint(NoorTheme.night)
            .activitySystemActionForegroundColor(NoorTheme.gold)
            .widgetURL(URL(string: "noor://prayers"))
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    NoorMark(height: 44, mood: .calm).padding(.leading, 4)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    PrayerCountdown(at: context.state.at, lang: context.attributes.lang, stale: context.isStale)
                        .font(.system(size: 18, weight: .bold, design: .rounded))
                        .foregroundStyle(NoorTheme.gold)
                        .frame(maxWidth: 96, alignment: .trailing)
                        .padding(.trailing, 4)
                }
                DynamicIslandExpandedRegion(.center) {
                    Text(context.state.name)
                        .font(.system(size: 20, weight: .bold, design: .rounded))
                        .foregroundStyle(NoorTheme.cream)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    HStack {
                        Text(context.attributes.city)
                        Spacer()
                        Text(context.state.at, style: .time)
                    }
                    .font(.system(size: 14, weight: .medium, design: .rounded))
                    .foregroundStyle(NoorTheme.mute)
                    .padding(.horizontal, 8)
                }
            } compactLeading: {
                HStack(spacing: 4) {
                    NoorMark(height: 20)
                    Text(context.state.name)
                        .font(.system(size: 13, weight: .semibold, design: .rounded))
                        .foregroundStyle(NoorTheme.gold)
                        .lineLimit(1)
                }
            } compactTrailing: {
                PrayerCountdown(at: context.state.at, lang: context.attributes.lang, stale: context.isStale)
                    .font(.system(size: 13, weight: .bold, design: .rounded))
                    .foregroundStyle(NoorTheme.gold)
                    .minimumScaleFactor(0.7)
                    .frame(maxWidth: 58, alignment: .trailing)
            } minimal: {
                NoorMark(height: 20)
            }
            .keylineTint(NoorTheme.gold)
            .widgetURL(URL(string: "noor://prayers"))
        }
    }
}

/// Minuteur tant que l'heure n'est pas passée, puis « C'est l'heure ».
struct PrayerCountdown: View {
    let at: Date
    let lang: String
    let stale: Bool

    var body: some View {
        if stale || at <= Date() {
            Text(lang == "fr" ? "C’est l’heure" : "It’s time")
                .lineLimit(1)
        } else {
            Text(timerInterval: Date()...at, countsDown: true)
                .monospacedDigit()
                .multilineTextAlignment(.trailing)
        }
    }
}

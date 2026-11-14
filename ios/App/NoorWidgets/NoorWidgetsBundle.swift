import SwiftUI
import WidgetKit

@main
struct NoorWidgetsBundle: WidgetBundle {
    var body: some Widget {
        VerseWidget()
        PrayerWidget()
        DhikrWidget()
        HijriWidget()
        PrayerLiveActivity()
    }
}

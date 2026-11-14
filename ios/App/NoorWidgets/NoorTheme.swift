import SwiftUI
import WidgetKit

enum NoorTheme {
    static let night = Color(red: 0.043, green: 0.122, blue: 0.118)
    static let deep = Color(red: 0.090, green: 0.251, blue: 0.235)
    static let cream = Color(red: 0.969, green: 0.941, blue: 0.878)
    static let mute = Color(red: 0.616, green: 0.722, blue: 0.698)
    static let gold = Color(red: 0.957, green: 0.741, blue: 0.314)
    static let leaf = Color(red: 0.310, green: 0.765, blue: 0.631)

    static var background: LinearGradient {
        LinearGradient(colors: [deep, night], startPoint: .topLeading, endPoint: .bottomTrailing)
    }

    /// Police coranique embarquée (AmiriQuran.ttf) ; iOS retombe sur sa police arabe si elle manque.
    static func arabic(_ size: CGFloat) -> Font { .custom("AmiriQuran-Regular", size: size) }
}

/// Les humeurs de Noor (une image par humeur dans le catalogue d'assets du widget).
enum NoorMood: String {
    case happy = "Noor"
    case calm = "NoorCalm"
    case wow = "NoorWow"
    case sleepy = "NoorSleepy"

    /// Noor somnole la nuit (22 h – 5 h) et sourit le reste du temps.
    static func forTime(_ date: Date) -> NoorMood {
        let hour = Calendar.current.component(.hour, from: date)
        return hour >= 22 || hour < 5 ? .sleepy : .happy
    }
}

/// Noor, la mascotte.
struct NoorMark: View {
    var height: CGFloat = 26
    var mood: NoorMood = .happy

    var body: some View {
        Image(mood.rawValue)
            .resizable()
            .scaledToFit()
            .frame(height: height)
            .accessibilityHidden(true)
    }
}

/// Message affiché tant que l'app n'a pas encore envoyé de données.
struct NoorEmptyView: View {
    let text: String

    var body: some View {
        VStack(spacing: 6) {
            NoorMark(height: 40)
            Text(text)
                .font(.caption)
                .multilineTextAlignment(.center)
                .foregroundStyle(NoorTheme.mute)
        }
    }
}

extension View {
    func noorBackground() -> some View {
        containerBackground(for: .widget) { NoorTheme.background }
    }
}

import Foundation
import Capacitor
import WidgetKit
import ActivityKit

/// Pont entre l'app web et iOS : écrit dans l'App Group lu par les widgets,
/// et démarre / arrête la Live Activity de la prochaine prière.
@objc(NoorBridgePlugin)
public class NoorBridgePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NoorBridgePlugin"
    public let jsName = "NoorBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setItems", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getItems", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startPrayerActivity", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "endPrayerActivity", returnType: CAPPluginReturnPromise),
    ]

    @objc func setItems(_ call: CAPPluginCall) {
        let items = call.getObject("items") ?? [:]
        let defaults = NoorShared.defaults
        for (key, value) in items {
            if let text = value as? String { defaults.set(text, forKey: key) }
        }
        WidgetCenter.shared.reloadAllTimelines()
        call.resolve()
    }

    @objc func getItems(_ call: CAPPluginCall) {
        let keys = call.getArray("keys", String.self) ?? []
        var out = JSObject()
        for key in keys { out[key] = NoorShared.string(key) }
        call.resolve(["items": out])
    }

    @objc func startPrayerActivity(_ call: CAPPluginCall) {
        guard let name = call.getString("name"), let at = call.getDouble("at") else {
            call.reject("name et at sont requis")
            return
        }
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            call.resolve(["ok": false, "reason": "disabled"])
            return
        }
        let date = Date(timeIntervalSince1970: at)
        let attributes = PrayerActivityAttributes(city: call.getString("city") ?? "", lang: call.getString("lang") ?? "fr")
        let state = PrayerActivityAttributes.ContentState(name: name, at: date)
        Task {
            for activity in Activity<PrayerActivityAttributes>.activities {
                await activity.end(nil, dismissalPolicy: .immediate)
            }
            do {
                _ = try Activity<PrayerActivityAttributes>.request(
                    attributes: attributes,
                    content: ActivityContent(state: state, staleDate: date),
                    pushType: nil
                )
                call.resolve(["ok": true])
            } catch {
                call.resolve(["ok": false, "reason": error.localizedDescription])
            }
        }
    }

    @objc func endPrayerActivity(_ call: CAPPluginCall) {
        Task {
            for activity in Activity<PrayerActivityAttributes>.activities {
                await activity.end(nil, dismissalPolicy: .immediate)
            }
            call.resolve()
        }
    }
}

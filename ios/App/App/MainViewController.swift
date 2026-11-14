import UIKit
import Capacitor

/// Enregistre le plugin local NoorBridge auprès de Capacitor.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(NoorBridgePlugin())
    }
}

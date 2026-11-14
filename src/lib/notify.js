import { LocalNotifications } from '@capacitor/local-notifications';

const HOURS = { morning: [7, 30], noon: [12, 30], evening: [21, 0] };

// Un seul rappel par jour, à l'heure du moment choisi. Renvoie true si le rappel est programmé.
export async function scheduleDaily(moment, body) {
  try {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') return false;
    const [hour, minute] = HOURS[moment] || HOURS.morning;
    await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
    await LocalNotifications.schedule({ notifications: [{ id: 1, title: 'Noor', body, schedule: { on: { hour, minute } } }] });
    return true;
  } catch { return false; }
}

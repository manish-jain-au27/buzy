import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { RemindpopupComponent } from '../remindpopup/remindpopup.component';
@Injectable({
  providedIn: 'root'
})
export class ReminderPopupService {
  constructor(private modalController?: ModalController) { }

  openModalAfterDelay(delay: number) {
    setTimeout(() => {
      this.openModal();
    }, delay);
  }

  async openModal() {
    const modal = await this.modalController.create({
      component: ReminderModalComponent // Replace YourModalComponent with the name of your modal component
    });
    await modal.present();
  }
}

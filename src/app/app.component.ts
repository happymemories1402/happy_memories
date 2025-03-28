import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class AppComponent {
  peopleCount: number = 1;
  bookingForm: FormGroup;
  selectedDecors: any[] = []; // Stores selected decorations
  occasions = ['Birthday', 'Anniversary', 'Other'];
  cakes = [
    { name: 'Classic Vanilla', price: 350},
    { name: 'Strawberry Delight', price: 450},
    { name: 'Fresh Pineapple', price: 450}
  ];

  rooms = [
    { name: 'Gala Red', price: 1000},
    { name: 'Dreamy Peach', price: 1000},
    { name: 'Golden serenity', price: 1200}
  ];

  specialDecor = [
    { name: 'Fog Entry', price: 500, image: 'assets/Matka.png' },
    { name: 'Balloon Decoration', price: 700, image: 'assets/balloon-decor.png' },
    { name: 'Flower Garland', price: 600, image: 'assets/flower-garland.png' },
    { name: 'LED Lights Setup', price: 800, image: 'assets/led-lights.png' },
    { name: 'Red Carpet Entry', price: 1000, image: 'assets/red-carpet.png' },
    { name: 'Table Centerpieces', price: 900, image: 'assets/table-centerpiece.png' }
  ];

  cart: any[] = [];
  total = 0;
  selectedCake: any = null;
  selectedRoom: any = null;
  totalAmount = 0;
  peoplePrice = 0;
  
  availableSlots = [
    { start: '9:00am', end: '11:00am' },
    { start: '11:30am', end: '1:30pm' },
    { start: '2:00pm', end: '4:00pm' },
    { start: '4:30pm', end: '6:30pm' },
    { start: '7:00pm', end: '9:30pm' },
  ];
  filteredSlots: { start: string; end: string }[] = [];
  today: string = '';
  formValid: boolean = false;

  constructor(private fb: FormBuilder) {
    this.bookingForm = this.fb.group({
      bookingName: ['', Validators.required],
      whatsappNumber: ['', Validators.required],
      email: ['', Validators.required],
      occasion: ['', Validators.required],
      specialPerson: [''],
      message: [''],
      peopleCount: [1],
      selectedDate: ['', Validators.required],
      selectedSlot: ['', Validators.required],
      roomType: ['Select Room', Validators.required], 
    });
    // Subscribe to form status changes
    this.bookingForm.statusChanges.subscribe(status => {
      this.formValid = status === 'VALID';
    });
  }

  ngOnInit() {
    const today = new Date();
    this.today = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    this.bookingForm.patchValue({ selectedDate: this.today });
    this.filterSlots(this.today);
  }

  onDateChange(event: any) {
    const selectedDate = event.target.value;
    this.filterSlots(selectedDate);
  }

  filterSlots(selectedDate: string) {
    const now = new Date();
    const isToday = selectedDate === this.today;
    this.filteredSlots = this.availableSlots.filter((slot) => {
      if (!isToday) return true;

      const slotTime = new Date();
      const [hours, minutes] = slot.start.split(':').map(Number);
      slotTime.setHours(hours, minutes, 0, 0);

      return slotTime > now;
    });
  }

  addToCart(item: any) {
    this.cart.push(item);
    this.total += item.price;
  }

  proceedToPay() {
    alert('Proceeding to payment with total: Rs. ' + this.total);
  }

  increment() {
    let value = this.bookingForm.get('peopleCount')?.value || 0;
    this.bookingForm.get('peopleCount')?.setValue(value + 1);
    this.updateTotal();
  }
  
  decrement() {
    let value = this.bookingForm.get('peopleCount')?.value || 0;
    if (value > 1) {
      this.bookingForm.get('peopleCount')?.setValue(value - 1);
      this.updateTotal();
    }
  }

  onCakeSelect(event: any) {
    const selectedValue = event.target.value;
    if (selectedValue) {
      const [name, price] = selectedValue.split('-');
      this.selectedCake = { name, price: Number(price) };
    } else {
      this.selectedCake = null;
    }
    this.updateTotal();
  }

  onRoomTypeSelect(event: any) {
    const selectedValue = event.target.value;
    if (selectedValue && selectedValue.trim() !== '') {
      const [name, price] = selectedValue.split('-');
      this.selectedRoom = { name, price: Number(price) };
      this.bookingForm.controls['roomType'].setValue(selectedValue);
    } else {
      this.bookingForm.controls['roomType'].setValue(''); 
      this.selectedRoom = null;
    }
    this.updateTotal();
  }

  toggleDecorSelection(decor: any, event: any) {
    if (event.target.checked) {
      this.selectedDecors.push(decor);
    } else {
      this.selectedDecors = this.selectedDecors.filter(item => item.name !== decor.name);
    }
    this.updateTotal();
  }

  updateTotal() {
    this.peopleCount = this.bookingForm.get('peopleCount')?.value || 1;
    this.peoplePrice = this.peopleCount <= 2 ? 0 : (this.peopleCount - 2) * 150;
    
    let cakePrice = this.selectedCake ? this.selectedCake.price : 0;
    let decorPrice = this.selectedDecors.reduce((total, decor) => total + decor.price, 0);
    let roomPrice = this.selectedRoom ? this.selectedRoom.price : 0;
    this.totalAmount = this.peoplePrice + cakePrice + decorPrice + roomPrice;
  }

  onSubmit() {
    if (this.bookingForm.invalid) {
      console.log("Please fill in all required fields!");
      return;
    }

    const bookingDetails = {
      ...this.bookingForm.value,
      selectedCake: this.selectedCake,
      selectedDecors: this.selectedDecors,
      totalAmount: this.totalAmount,
      selectedRoom: this.selectedRoom
    };

    this.sendEmail(bookingDetails);
  }

  sendEmail(bookingDetails: any) {
      const serviceID = 'service_2eie2bp';
      const templateID = 'template_tln5saz';
      const publicKey = 'eS0oAY2IJZYuBrpLP';
      console.log('bookingDetails: ', bookingDetails);
      const templateParams = {
        to_email: bookingDetails.email,
        booking_name: bookingDetails.bookingName,
        whatsapp_number: bookingDetails.whatsappNumber,
        occasion: bookingDetails.occasion,
        people_count: bookingDetails.peopleCount,
        special_person_name: bookingDetails.specialPerson,
        message: bookingDetails.message,
        selected_date: bookingDetails.selectedDate,
        selected_slot: bookingDetails.selectedSlot,
        selected_room_type: bookingDetails.selectedRoom.name,
        selected_room_price: bookingDetails.selectedRoom.price,
        selected_cake: bookingDetails.selectedCake?.name || 'None',
        cake_price: bookingDetails.selectedCake?.price || '0',
        selected_decor: bookingDetails.selectedDecors?.map((decor: { name: string }) => decor.name).join(', ') || 'None',
        decor_price: bookingDetails.selectedDecors?.reduce((sum: number, decor: { price: number }) => sum + decor.price, 0) || 0,
        total_amount: bookingDetails.totalAmount
      };

      console.log('Template Params: ',templateParams);

      window.location.href = '/assets/welcome.html';
  
      // emailjs.send(serviceID, templateID, templateParams, publicKey)
      //   .then(response => {
      //     console.log('Email sent successfully!', response);
      //     window.location.href = '/assets/welcome.html';
      //     //alert('Booking confirmation email sent!');
      //   })
      //   .catch(error => {
      //     console.error('Email sending failed:', error);
      //     alert('Error sending email. Please try again.');
      //   });
  }
  
}

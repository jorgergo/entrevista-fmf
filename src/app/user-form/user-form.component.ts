import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import jsPDF from "jspdf";

import { nacionalidades } from "../data/nacionalidades";
import { clubes } from "../data/clubes";
import { generos } from "../data/generos";

@Component({
  selector: "app-user-form",
  templateUrl: "./user-form.component.html",
  styleUrls: ["./user-form.component.css"],
})
export class UserFormComponent implements OnInit {
  nacionalidadesOptions: string[] = [];
  generosOptions: string[] = [];
  clubesOptions: string[] = [];
  showRFC: boolean = false;
  submitted: boolean = false;
  showDownloadButton: boolean = false;
  rfcError: string = "";
  selectedClubLogo: string = "";

  profileForm = new FormGroup({
    firstName: new FormControl("", Validators.required),
    fatherLastName: new FormControl("", Validators.required),
    motherLastName: new FormControl("", Validators.required),
    birthDate: new FormControl("", Validators.required),
    gender: new FormControl("", Validators.required),
    nationality: new FormControl("", Validators.required),
    club: new FormControl("", Validators.required),
    rfc: new FormControl(""),
    ocupation: new FormControl("", Validators.required),
  });

  constructor() {}

  ngOnInit(): void {
    this.nacionalidadesOptions = nacionalidades.map((n) => n.nombre);
    this.generosOptions = generos.map((g) => g.nombre);
    this.clubesOptions = clubes.map((c) => c.nombre);

    this.profileForm.get("birthDate").valueChanges.subscribe(() => {
      this.checkAge();
    });

    this.profileForm.get("club").valueChanges.subscribe((clubName) => {
      const selectedClub = clubes.find((club) => club.nombre === clubName);
      this.selectedClubLogo = selectedClub ? selectedClub.logo : "";
    });
  }

  checkAge() {
    const birthDate = new Date(this.profileForm.get("birthDate").value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    this.showRFC = age >= 18;
  }

  generateRFC(): string {
    const firstName = this.profileForm.get("firstName").value;
    const fatherLastName = this.profileForm.get("fatherLastName").value;
    const motherLastName = this.profileForm.get("motherLastName").value;
    const birthDate = new Date(this.profileForm.get("birthDate").value);

    const firstVowel = fatherLastName.match(/[AEIOUaeiou]/)?.[0] || "";
    const rfc =
      `${fatherLastName[0]}${firstVowel}${motherLastName[0]}${firstName[0]}`.toUpperCase();

    const year = birthDate.getFullYear().toString().slice(-2);
    const month = (birthDate.getMonth() + 1).toString().padStart(2, "0");
    const day = (birthDate.getDate() + 1).toString().padStart(2, "0");
    const datePart = `${year}${month}${day}`;
    const homokey = "xxx";

    return `${rfc}${datePart}${homokey}`;
  }

  onSubmit() {
    const generatedRFC = this.generateRFC();
    const providedRFC = this.profileForm.get("rfc").value;

    const fixedGeneratedRFC = generatedRFC.slice(0, -3);
    const fixedProvidedRFC = providedRFC.slice(0, -3);

    if (this.showRFC && fixedGeneratedRFC !== fixedProvidedRFC) {
      this.rfcError = `RFC does not match. Expected: ${fixedGeneratedRFC}XXX`;
      return;
    }

    this.rfcError = "";
    this.submitted = true;
    this.showDownloadButton = true;
    console.log(this.profileForm.value);
  }

  downloadPDF() {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Información del usuario", 20, 20);

    doc.setFontSize(14);
    doc.text(
      `Nombre: ${this.profileForm.value.firstName} ${this.profileForm.value.fatherLastName} ${this.profileForm.value.motherLastName}`,
      20,
      30
    );
    doc.text(
      `Fecha de nacimiento: ${this.profileForm.value.birthDate}`,
      20,
      40
    );
    doc.text(`Género: ${this.profileForm.value.gender}`, 20, 50);
    doc.text(`Nacionalidad: ${this.profileForm.value.nationality}`, 20, 60);
    doc.text(`Club: ${this.profileForm.value.club}`, 20, 70);
    if (this.showRFC) {
      doc.text(`RFC: ${this.profileForm.value.rfc}`, 20, 80);
    }
    doc.text(`Ocupación: ${this.profileForm.value.ocupation}`, 20, 90);

    doc.save("usuario.pdf");
  }
}

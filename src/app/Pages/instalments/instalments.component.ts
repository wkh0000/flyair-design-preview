import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface InstalmentRow {
  bank: string;
  mode: 'Online Payment' | 'Call to Convert';
  m3: string;
  m6: string;
  m12: string;
  m18: string;
  m24: string;
  m36: string;
}

@Component({
  selector: 'app-instalments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './instalments.component.html',
  styleUrl: './instalments.component.scss',
})
export class InstalmentsComponent {
  rows: InstalmentRow[] = [
    { bank: 'Sampath Bank',          mode: 'Online Payment',  m3: '–', m6: '2%', m12: '0%', m18: '–',  m24: '0%', m36: '–'   },
    { bank: 'Commercial Bank',       mode: 'Online Payment',  m3: '–', m6: '0%', m12: '2%', m18: '4%', m24: '5%', m36: '13%' },
    { bank: 'Nations Trust (Amex)',  mode: 'Online Payment',  m3: '–', m6: '0%', m12: '0%', m18: '–',  m24: '–',  m36: '–'   },
    { bank: 'Peoples Bank',          mode: 'Call to Convert', m3: '0%', m6: '0%', m12: '0%', m18: '0%', m24: '0%', m36: '0%'  },
    { bank: 'Seylan Bank',           mode: 'Call to Convert', m3: '0%', m6: '0%', m12: '0%', m18: '–',  m24: '–',  m36: '–'   },
    { bank: 'HNB',                   mode: 'Call to Convert', m3: '–', m6: '–',  m12: '0%', m18: '–',  m24: '–',  m36: '–'   },
    { bank: 'DFCC Bank',             mode: 'Call to Convert', m3: '–', m6: '–',  m12: '0%', m18: '–',  m24: '0%', m36: '–'   },
    { bank: 'Pan Asia Bank',         mode: 'Call to Convert', m3: '–', m6: '–',  m12: '0%', m18: '–',  m24: '0%', m36: '–'   },
    { bank: 'Standard Chartered',    mode: 'Call to Convert', m3: '–', m6: '–',  m12: '0%', m18: '–',  m24: '–',  m36: '–'   },
  ];
}

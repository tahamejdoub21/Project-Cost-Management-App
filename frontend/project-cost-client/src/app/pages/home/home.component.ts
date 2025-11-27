import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface ColorGroup {
  name: string;
  colors: ColorItem[];
}

interface ColorItem {
  name: string;
  value: string;
  variable: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  colorGroups: ColorGroup[] = [
    {
      name: 'Primary Colors',
      colors: [
        { name: 'Primary 50', value: '#eef2ff', variable: '$primary-50' },
        { name: 'Primary 100', value: '#e0e7ff', variable: '$primary-100' },
        { name: 'Primary 200', value: '#c7d2fe', variable: '$primary-200' },
        { name: 'Primary 300', value: '#a5b4fc', variable: '$primary-300' },
        { name: 'Primary 400', value: '#818cf8', variable: '$primary-400' },
        { name: 'Primary 500', value: '#6366f1', variable: '$primary-500' },
        { name: 'Primary 600', value: '#4f46e5', variable: '$primary-600' },
        { name: 'Primary 700', value: '#4338ca', variable: '$primary-700' },
        { name: 'Primary 800', value: '#3730a3', variable: '$primary-800' },
        { name: 'Primary 900', value: '#312e81', variable: '$primary-900' },
      ],
    },
    {
      name: 'Secondary Colors',
      colors: [
        { name: 'Secondary 500', value: '#a855f7', variable: '$secondary-500' },
        { name: 'Secondary 600', value: '#9333ea', variable: '$secondary-600' },
        { name: 'Secondary 700', value: '#7e22ce', variable: '$secondary-700' },
      ],
    },
    {
      name: 'Accent Colors',
      colors: [
        { name: 'Accent 500', value: '#06b6d4', variable: '$accent-500' },
        { name: 'Accent 600', value: '#0891b2', variable: '$accent-600' },
      ],
    },
    {
      name: 'Semantic Colors',
      colors: [
        { name: 'Success', value: '#22c55e', variable: '$success-500' },
        { name: 'Warning', value: '#f59e0b', variable: '$warning-500' },
        { name: 'Error', value: '#ef4444', variable: '$error-500' },
        { name: 'Info', value: '#3b82f6', variable: '$info-500' },
      ],
    },
  ];

  fontWeights = [
    { name: 'Light', value: '300', variable: '$font-weight-light', class: 'weight-300' },
    { name: 'Regular', value: '400', variable: '$font-weight-regular', class: 'weight-400' },
    { name: 'Medium', value: '500', variable: '$font-weight-medium', class: 'weight-500' },
    { name: 'Semibold', value: '600', variable: '$font-weight-semibold', class: 'weight-600' },
    { name: 'Bold', value: '700', variable: '$font-weight-bold', class: 'weight-700' },
  ];

  fontSizes = [
    { name: 'XS', value: '12px', variable: '$font-size-xs', class: 'size-xs' },
    { name: 'SM', value: '14px', variable: '$font-size-sm', class: 'size-sm' },
    { name: 'Base', value: '16px', variable: '$font-size-base', class: 'size-base' },
    { name: 'LG', value: '18px', variable: '$font-size-lg', class: 'size-lg' },
    { name: 'XL', value: '20px', variable: '$font-size-xl', class: 'size-xl' },
    { name: '2XL', value: '24px', variable: '$font-size-2xl', class: 'size-2xl' },
    { name: '3XL', value: '30px', variable: '$font-size-3xl', class: 'size-3xl' },
    { name: '4XL', value: '36px', variable: '$font-size-4xl', class: 'size-4xl' },
  ];

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      console.log('Copied:', text);
    });
  }
}

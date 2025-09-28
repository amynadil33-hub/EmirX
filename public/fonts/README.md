# Dhivehi Font Files

This directory should contain the Dhivehi (Thaana) font files for proper rendering of Dhivehi text.

## Required Fonts

1. **MV_Faseyha.ttf** - Primary Dhivehi font
2. **Faruma.ttf** - Alternative Dhivehi font

## Installation

1. Download the fonts from official sources:
   - MV Faseyha: Available from Maldivian font repositories
   - Faruma: Open source Dhivehi font

2. Place the `.ttf` files in this directory (`public/fonts/`)

3. The application will automatically use these fonts for Dhivehi text rendering

## Font Usage

The fonts are automatically applied to any element with the `.dhivehi-text` class, which includes:
- RTL text direction
- Proper Unicode bidirectional isolation
- Optimized line height for Thaana script

## Note

Without these font files, Dhivehi text may not render correctly. The system will fall back to system fonts, but the display quality may be compromised.
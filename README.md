# Brain Freeze - MTG Combo Tool

A Progressive Web App (PWA) for calculating and simulating the Brain Freeze combo from Magic: The Gathering.

## Features

### 🧮 Calculator
- Calculate maximum opponent mill with the Underworld Breach combo
- Input your remaining library size
- Choose between Lion's Eye Diamond or Lotus Petal
- Support for **Thousand-Year Storm** and **The Water Crystal** modifiers
- Detailed breakdown showing:
  - Storm copies vs Thousand-Year Storm copies
  - Water Crystal bonus calculations
  - Mill distribution (self vs opponents)
  - Step-by-step casting sequence with running totals

### 🎮 Interactive Sandbox
- Step-by-step combo simulation (Lotus Petal version)
- Visual event log with step numbers and running totals
- Track storm count, mana pool, and mill totals in real-time
- Play cards: Underworld Breach, Lotus Petal, Brain Freeze
- Manual controls for mana and storm count adjustments
- Configurable graveyard and library sizes
- Reset and try different sequences
- *Coming soon: LED, Thousand-Year Storm, and Water Crystal support*

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Custom CSS** - Modern, responsive styling with CSS variables
- **Vite PWA Plugin** - Progressive Web App capabilities

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/brain-freeze-bob.git
cd brain-freeze-bob
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## PWA Installation

### Desktop
1. Open the app in Chrome, Edge, or another PWA-compatible browser
2. Look for the install icon in the address bar
3. Click "Install" to add to your desktop

### Android
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home screen"
4. The app will install as a standalone application

## How the Combo Works

The Brain Freeze combo uses **Underworld Breach** to repeatedly cast spells from your graveyard:

### Basic Combo (Lotus Petal)
1. **Setup**: You need 9 cards in your graveyard and Underworld Breach in play
2. **Loop**:
   - Cast 2 Lotus Petals from graveyard (exile 6 cards, generate 2 blue mana)
   - Cast Brain Freeze from graveyard (exile 3 cards, costs 2 mana)
   - Brain Freeze mills 3 cards × storm count
   - 9 cards go to your graveyard (self-mill to refuel)
   - Remaining mill goes to opponents
3. **Repeat**: Continue until your library is depleted

### LED Variant
- Only needs 6 cards in graveyard (1 LED + Brain Freeze)
- LED generates 3 mana, leaving 1 floating after Brain Freeze

### Storm Count Calculation
- Each spell cast increases storm count by 1
- Brain Freeze mills 3 cards per storm count (including itself)
- Storm copies are separate from Thousand-Year Storm copies

### Modifiers
- **Thousand-Year Storm**: Creates additional copies based on previous instant/sorcery spells cast
- **The Water Crystal**: Reduces blue spell costs by 1, adds +4 mill per Brain Freeze copy hitting opponents

## Project Structure

```
brain-freeze-bob/
├── public/
│   └── icons/           # PWA icons
├── src/
│   ├── components/
│   │   ├── Calculator.jsx      # Calculator component
│   │   ├── Calculator.scss     # Calculator styles
│   │   ├── Sandbox.jsx         # Sandbox component
│   │   └── Sandbox.scss        # Sandbox styles
│   ├── App.jsx          # Main app component
│   ├── App.scss         # App styles
│   ├── main.jsx         # Entry point
│   └── index.scss       # Global styles
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies
```

## Customization

### Icons
Replace the placeholder icons in `public/icons/` with your own:
- `icon-192.png` - 192x192px
- `icon-512.png` - 512x512px

You can use the provided SVG (`icon-placeholder.svg`) as a template.

### Theme
The app uses a custom dark theme with CSS variables. To customize colors, modify the variables in `src/index.css`:

```css
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #1a1a1a;
  --accent-primary: #0f62fe;
  /* ... and more */
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Magic: The Gathering is © Wizards of the Coast
- Built with [React](https://react.dev/) and [Vite](https://vitejs.dev/)
- PWA functionality powered by [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
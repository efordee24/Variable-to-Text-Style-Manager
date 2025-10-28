# Variable Binder for Text Styles

A Figma plugin that bulk applies Variables to existing Text Styles with auto-matching capabilities and a custom React UI.

## Features

- **Auto-matching**: Automatically matches variables to text style properties by comparing values
- **Manual override**: Fine-tune variable assignments with a table interface
- **Bulk updates**: Apply variable bindings to multiple text styles at once
- **Variable collections**: Organize variables by property type (font, size, weight, etc.)
- **CSV export**: Export your text style data for auditing
- **Modern UI**: Built with React and TypeScript for a smooth user experience

## Setup Instructions

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Figma Desktop app

### Installation

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd Variable-to-Text-Style-Manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the plugin**
   ```bash
   npm run build
   ```

4. **Load the plugin in Figma**
   - Open Figma Desktop
   - Go to Plugins → Development → Import plugin from manifest...
   - Select the `manifest.json` file from this project
   - The plugin will appear in your plugins list

### Development

For development with hot reload:

```bash
npm run dev
```

This will watch for changes and rebuild automatically.

### Project Structure

```
src/
├── code.ts              # Main plugin code (Figma API)
├── bridge.ts            # IPC communication
├── figma-api.ts         # Figma API interactions
├── matching.ts          # Auto-matching logic
├── types.ts             # Shared TypeScript types
└── ui/                  # React UI
    ├── index.html       # UI entry point
    ├── main.tsx         # React app entry
    ├── App.tsx          # Main app component
    ├── styles.css       # Global styles
    └── components/      # React components
        ├── VariableGroupPicker.tsx
        ├── StyleTable.tsx
        ├── CellSelector.tsx
        ├── Toast.tsx
        └── EmptyState.tsx
```

## Usage

1. **Open the plugin** in a Figma file with text styles and variables
2. **Select variable collections** for each property type (font family, size, weight, etc.)
3. **Review auto-matches** - the plugin will automatically suggest variable matches
4. **Make manual adjustments** using the table interface if needed
5. **Click "Update Styles"** to apply all variable bindings
6. **Export CSV** to audit your changes

## Supported Properties

- **Font Family** (string variables)
- **Font Size** (number variables) 
- **Font Weight** (number variables)
- **Line Height** (number variables)
- **Letter Spacing** (number variables)

## Technical Details

- **Framework**: React 18 + TypeScript
- **Build tool**: Vite
- **IPC**: Custom message bridge between UI and worker
- **Styling**: CSS with modern design system
- **API**: Latest Figma Variables API

## Troubleshooting

### Plugin won't load
- Ensure you've built the project with `npm run build`
- Check that `manifest.json` points to the correct file paths
- Verify Figma Desktop is up to date

### No variables found
- Make sure your file has variable collections
- Check that variables are published/available in the current file

### Auto-matching not working
- Verify variable values match text style property values exactly
- Check that you've selected the correct variable collection for each property

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
# N8N Chat Frontend

A modern React-based chat interface for interacting with your N8N AI SQL assistant. Features a ChatGPT-like interface with a sidebar for viewing the AI's thinking process.

## Features

- 🎯 **ChatGPT-like Interface**: Clean, modern chat interface
- 🧠 **Thinking Process Sidebar**: View AI reasoning steps in real-time
- 🌐 **Bilingual Support**: Works with both Chinese and English queries
- 🔄 **Real-time Updates**: Instant responses from your N8N workflow
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Beautiful UI**: Modern design with smooth animations

## Prerequisites

- Node.js 16+ installed
- N8N server running on `http://localhost:5277`
- Your N8N webhook workflow active and in test mode

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Start N8N**: Make sure your N8N server is running on port 5277
2. **Activate Webhook**: In your N8N workflow, click "Test workflow" to activate the webhook
3. **Send Messages**: Type your questions about ABI sales data in the chat interface
4. **View Thinking Process**: Click the brain icon or "View thinking process" to see AI reasoning

## N8N Webhook Configuration

Your N8N webhook should:
- Listen on `/webhook-test/abi-test`
- Accept POST requests with JSON payload: `{"text": "your_question"}`
- Return JSON response with `result` and `steps` fields

## Example Queries

- "最近一个月在广东ABI的销量总量是多少？"
- "What are the top ABI brands in Guangdong?"
- "Show me ABI sales trends for the last quarter"

## Project Structure

```
src/
├── components/
│   ├── ChatInterface.jsx    # Main chat interface
│   └── ThinkingSidebar.jsx  # Thinking process sidebar
├── services/
│   └── api.js              # API service for webhook calls
├── App.jsx                 # Main app component
├── App.css                 # Custom styles
└── index.js               # Entry point
```

## Customization

### Styling
- Edit `tailwind.config.js` to customize colors and themes
- Modify `src/App.css` for custom styles

### API Endpoint
- Update `src/services/api.js` to change the webhook URL

### UI Components
- Customize chat bubbles in `ChatInterface.jsx`
- Modify thinking process display in `ThinkingSidebar.jsx`

## Troubleshooting

### Empty Responses
- Ensure N8N webhook is in "test mode" (click "Test workflow")
- Check that the webhook URL is correct
- Verify N8N server is running on port 5277

### Connection Errors
- Check if N8N server is accessible
- Verify CORS settings if running on different ports
- Ensure firewall allows connections to port 5277

### Styling Issues
- Run `npm run build` to ensure Tailwind CSS is compiled
- Clear browser cache and reload

## Development

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own N8N chat interfaces! 
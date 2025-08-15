const express = require('express');
const bodyParser = require('body-parser');
const { Chart } = require('chart.js'); // ✅ Fixed import
const ChartDataLabels = require('chartjs-plugin-datalabels');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

// Register datalabels plugin
Chart.register(ChartDataLabels);

const app = express();
const port = 3301;

const width = 800;
const height = 600;
const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width,
    height,
    chartCallback: (ChartJS) => {
        ChartJS.register(ChartDataLabels); // not strictly needed since already registered above
    }
});

app.use(bodyParser.json({ limit: '2mb' }));

app.post('/chart', async (req, res) => {
    try {
        const chartConfig = req.body.chartConfig;
        if (!chartConfig) {
            return res.status(400).json({ error: 'Missing chartConfig in request body' });
        }

        const imageBuffer = await chartJSNodeCanvas.renderToBuffer(chartConfig);

        res.set('Content-Type', 'image/png');
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error generating chart:', error);
        res.status(500).json({ error: 'Failed to generate chart' });
    }
});

app.listen(port, () => {
    console.log(`Chart server running at http://localhost:${port}`);
});

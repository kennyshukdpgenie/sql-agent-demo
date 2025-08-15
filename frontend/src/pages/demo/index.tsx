import React, { useState } from 'react';
import ChatInterface from '../../components/ChatInterface';
import { Box, Tabs, Tab, Typography, Paper, Grid, List, ListItem, ListItemText, Button, Modal, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Download, Eye } from 'lucide-react';
import './Demo.css';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`demo-tabpanel-${index}`}
      aria-labelledby={`demo-tab-${index}`}
      style={{ height: 'calc(100vh - 120px)', overflow: 'auto' }}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3, height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function IntroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sampleData, setSampleData] = useState([
    { period: '202401', region: 'East', brand: 'Chivas Regal 12 YO', channel: 'HQ/Hotel', intake: 1250, ytd: 1250, mtd: 1250 },
    { period: '202401', region: 'East', brand: 'Absolut Blue', channel: 'HQ/Hotel', intake: 890, ytd: 890, mtd: 890 },
    { period: '202401', region: 'South', brand: 'Chivas Regal 12 YO', channel: 'Premium', intake: 2100, ytd: 2100, mtd: 2100 },
    { period: '202401', region: 'South', brand: 'Absolut Blue', channel: 'Premium', intake: 1560, ytd: 1560, mtd: 1560 },
    { period: '202401', region: 'East', brand: 'Martell', channel: 'Prestigious', intake: 750, ytd: 750, mtd: 750 },
    { period: '202402', region: 'East', brand: 'Chivas Regal 12 YO', channel: 'HQ/Hotel', intake: 1350, ytd: 2600, mtd: 1350 },
    { period: '202402', region: 'East', brand: 'Absolut Blue', channel: 'HQ/Hotel', intake: 920, ytd: 1810, mtd: 920 },
    { period: '202402', region: 'South', brand: 'Chivas Regal 12 YO', channel: 'Premium', intake: 2250, ytd: 4350, mtd: 2250 },
    { period: '202402', region: 'South', brand: 'Absolut Blue', channel: 'Premium', intake: 1680, ytd: 3240, mtd: 1680 },
    { period: '202402', region: 'East', brand: 'Martell', channel: 'Prestigious', intake: 800, ytd: 1550, mtd: 800 }
  ]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/assets/SOG_Sample.xlsx';
    link.download = 'SOG_Sample.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewData = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
    <Paper elevation={3} sx={{ p: 4, maxWidth: '1200px', mx: 'auto', my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        SQL Agent Demo
      </Typography>
      <Typography variant="h6" component="h2" gutterBottom>
        Created by Kenny Shu
      </Typography>
      <Typography paragraph>
        Welcome to the SQL Agent Demo. This application demonstrates an AI-powered SQL assistant
        that can help you query databases using natural language.
      </Typography>
      
        <Box sx={{ mb: 3, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            📊 Test Dataset
          </Typography>
          <Typography paragraph>
            Download our sample dataset to test the SQL Agent capabilities:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleDownload}
              sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
            >
              Download SOG Sample Dataset
            </Button>
            <Button
              variant="outlined"
              startIcon={<Eye />}
              onClick={handleViewData}
              sx={{ borderColor: '#1976d2', color: '#1976d2', '&:hover': { borderColor: '#1565c0', color: '#1565c0' } }}
            >
              Click to View
            </Button>
          </Box>
      </Box>
        
        <img src="/assets/Process_Map.png" alt="Process Map" style={{ width: '100%', margin: '20px 0' }} />

      <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
        About the Demo Data
      </Typography>
      <Typography paragraph>
        The demo includes two databases:
      </Typography>
      <ul>
        <li><strong>Inventory Database:</strong> Contains data about product stock levels.</li>
        <li><strong>Volume Database:</strong> Contains data about sales volume.</li>
      </ul>
      <Typography paragraph>
        Both databases are segmented by the following dimensions:
      </Typography>
      <ul>
        <li><strong>Region:</strong> East, West, South, North, and Central</li>
        <li><strong>Channel:</strong> EC (E-commerce), MOT (Modern On-Trade), and MAC_ON (Macro On-Trade)</li>
      </ul>
      
      <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
          Questions to Ask – Levels of Complexity
      </Typography>
        
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Level 1: Pure Query + Simple Calculation (Checked)
        </Typography>
        <Typography paragraph>
          Basic data lookup or total value.
        </Typography>
        <Typography component="div">
          <ul>
            <li>What are the total volumes for the last 11 months ("YTD" year-to-day through May)?</li>
            <li>What are the south region total volumes for CNY? (Need to Define what is CNY in prompt)</li>
          </ul>
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Level 2: Sum + Group By Query (Checked)
        </Typography>
        <Typography paragraph>
          Grouped aggregation for better breakdown.
        </Typography>
        <Typography component="div">
          <ul>
            <li>What is the total volume performance of each region and each product?</li>
          </ul>
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Level 3: Comparison, Growth Check, Filtered Condition, Ranking (Checked)
        </Typography>
        <Typography paragraph>
          Includes filtering, period comparison, percentage changes, and rankings.
        </Typography>
        <Typography component="div">
          <ul>
            <li>Which brand has the stock inventory has the highest decrease percentages YTD compare to last year in Mac-On Channel?</li>
            <li>Rank the top 10 best selling volume products in south for me</li>
            <li>(Analysis Question) Which region / brand do you foresee an out-of-stock inventory risk?</li>
          </ul>
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Level 4: Open Question Analysis (No Definite Answer)
        </Typography>
        <Typography paragraph>
          Analytical or predictive questions—exploratory in nature.
        </Typography>
        <Typography component="div">
          <ul>
            <li>(Analysis Question) Can you analyze the relationship between stock and volume for south region breakdown by brand?</li>
            <li>(Open Question) Which region do you predict to have the most promising growth in the future?</li>
          </ul>
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Graph Request
        </Typography>
        <Typography paragraph>
          Visual format request for better insights.
        </Typography>
        <Typography component="div">
          <ul>
            <li>pie chart: Volume by Brand of south region (question has to contain pie or chart to trigger)</li>
          </ul>
        </Typography>

      <Typography variant="subtitle1" sx={{ mt: 4, fontWeight: 'bold' }}>
        Try asking questions like:
      </Typography>
      <ul>
        <li>"Show me the top 5 customers by revenue"</li>
        <li>"What was our sales growth last quarter compared to the previous quarter?"</li>
        <li>"Which products have the highest profit margin?"</li>
      </ul>

        <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
          Q&A Session
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          Need to check column Identification:
        </Typography>
        <Typography paragraph>
          <strong>Can the AI identify and understand the meaning of the different columns in the SOG, Inventory, and Volume reports?</strong>
          <br />
          Yes, you can define it in the prompt for abbreviation, and I recommend to have clear and standard column names for database.
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          Check if AI can do recognition of measurement Units:
        </Typography>
        <Typography paragraph>
          <strong>Is the AI able to recognize the units of measurement used, particularly volumes expressed in thousands of liters (K 9LC)?</strong>
          <br />
          Yes if the column specify it and it can also do unit conversion (can convert it to k).
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          Check if she does the distinction of report elements:
        </Typography>
        <Typography paragraph>
          <strong>Can the AI distinguish between headers, raw data, and totals? Test this with questions such as "What is the volume of Jameson for the month of May?" or "What is the volume in the southern region?" "Give me the total of Martel".</strong>
          <br />
          No, but we will have to do transformation of the your financial report into relational database anyway to process.
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          Check if she does the differentiation between report types:
        </Typography>
        <Typography paragraph>
          <strong>Can the AI differentiate between SOG reports and Inventory reports without confusing the data?</strong>
          <br />
          Yes, they will be processed into difference tables and saved into different databases.
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          Check if AI can do analysis of annual variations:
        </Typography>
        <Typography paragraph>
          <strong>Can the AI identify increases and decreases from one year to another? Ask questions like "Compare the volume of Royal Salute between May 2024 and May 2025" or "What is the percentage decrease of Absolut?"</strong>
          <br />
          Yes.
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          Check if she can do identification of specific periods: (Optional for now)
        </Typography>
        <Typography paragraph>
          <strong>Is the AI capable of identifying specific seasons or periods that impact sales or stocks (such as year-end, sales events, New Year, etc.)?</strong>
          <br />
          Needs to define the definition of year-end (April - June), New Year(Dec-Feb). Example of CNY and MAF.
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          Check if she can adapt to new formats:
        </Typography>
        <Typography paragraph>
          <strong>Can the AI adapt to new file formats or the addition of new variables, such as new products, columns, or Excel sheets?</strong>
          <br />
          Yes, I have python automation scripts to do the job.
        </Typography>

        <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
          Summary & Follow-up:
        </Typography>
        <Typography component="div">
          <ul>
              <li>Check what types of tables are already included in the database</li>
              <li>Confirm everything you need are already in database, otherwise I can provide a solution to do data transformation</li>
              <li>Check legal complience of submitting this data to openAI (because we will call openAI api point at this point, the open-source model like deepseek cannot achieve the same quality of work) At least from GDA perspective, openAI are very unlikely to use our data (openAI will not see our full database not only some sample data, execution result to understand the datastructure because the full data table will remain in our database)</li>
              <li>Define the scope you want to have in this project</li>
          </ul>
        </Typography>
    </Paper>

      {/* Data Preview Modal */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="data-preview-modal"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Box sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          maxWidth: 800,
          maxHeight: '80vh',
          overflow: 'auto'
        }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Sample Dataset Preview (First 10 Rows)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This is a preview of the SOG Sample dataset structure and sample data.
          </Typography>
          
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Period</strong></TableCell>
                  <TableCell><strong>Region</strong></TableCell>
                  <TableCell><strong>Brand</strong></TableCell>
                  <TableCell><strong>Channel</strong></TableCell>
                  <TableCell><strong>Intake</strong></TableCell>
                  <TableCell><strong>YTD</strong></TableCell>
                  <TableCell><strong>MTD</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sampleData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.period}</TableCell>
                    <TableCell>{row.region}</TableCell>
                    <TableCell>{row.brand}</TableCell>
                    <TableCell>{row.channel}</TableCell>
                    <TableCell>{row.intake.toLocaleString()}</TableCell>
                    <TableCell>{row.ytd.toLocaleString()}</TableCell>
                    <TableCell>{row.mtd.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleCloseModal} variant="contained">
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

function Demo() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <div className="Demo">
      {/* Pernod Ricard Header */}
      <div className="bg-pr-blue-dark border-b border-chat-border px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <img 
            src="/assets/logo.png" 
            alt="Pernod Ricard Logo" 
            className="h-10 w-auto"
          />
          <div>
            <h1 className="text-xl font-bold text-pr-white">Pernod Ricard SQL Agent Demo</h1>
            <p className="text-sm text-pr-blue-light">AI-powered SQL query assistant</p>
          </div>
        </div>
      </div>

      {/* Page Selection Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="demo tabs">
          <Tab label="Intro" id="demo-tab-0" aria-controls="demo-tabpanel-0" />
          <Tab label="Chat" id="demo-tab-1" aria-controls="demo-tabpanel-1" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <IntroSection />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <ChatInterface />
      </TabPanel>
    </div>
  );
}

export default Demo; 
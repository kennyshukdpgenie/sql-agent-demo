import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Calculate element height in mm
 * @param {HTMLElement} element - Element to measure
 * @returns {number} - Height in mm
 */
const getElementHeightMM = (element) => {
  const elementHeight = element.offsetHeight;
  return (elementHeight * 25.4) / 96; // Convert pixels to mm
};

/**
 * Generate PDF from chat messages with intelligent page breaking
 * @param {Array} messages - Array of chat messages
 * @param {string} title - Title for the PDF
 * @param {Function} onProgress - Optional progress callback function
 * @returns {Promise<void>}
 */
export const generateChatPDF = async (messages, title = 'Chat History', onProgress = null) => {
  try {
    // Validate inputs
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid messages array provided');
    }
    
    if (!title || typeof title !== 'string') {
      title = 'Chat History';
    }

    // Helper function to preload images
    const preloadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    // Update progress
    if (onProgress) onProgress(10, 'Preparing content...');

    // Create a temporary container for the chat content
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px';
    container.style.padding = '20px';
    container.style.backgroundColor = 'white';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.fontSize = '14px';
    container.style.lineHeight = '1.6';
    container.style.overflow = 'hidden'; // Prevent scrollbars
    
    // Add title
    const titleElement = document.createElement('h1');
    titleElement.textContent = title;
    titleElement.style.color = '#333';
    titleElement.style.borderBottom = '2px solid #007bff';
    titleElement.style.paddingBottom = '10px';
    titleElement.style.marginBottom = '20px';
    titleElement.setAttribute('data-content-type', 'title');
    container.appendChild(titleElement);
    
    // Add timestamp
    const timestampElement = document.createElement('p');
    timestampElement.textContent = `Generated on: ${new Date().toLocaleString()}`;
    timestampElement.style.color = '#666';
    timestampElement.style.fontSize = '12px';
    timestampElement.style.marginBottom = '20px';
    timestampElement.setAttribute('data-content-type', 'timestamp');
    container.appendChild(timestampElement);
    
    if (onProgress) onProgress(20, 'Processing messages...');
    
    // Add messages with data attributes for page breaking
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      
      // Skip invalid messages
      if (!message || typeof message !== 'object') {
        continue;
      }
      
      const messageDiv = document.createElement('div');
      messageDiv.setAttribute('data-message-index', i);
      messageDiv.setAttribute('data-content-type', 'message');
      messageDiv.setAttribute('data-has-graph', message.isGraph ? 'true' : 'false');
      messageDiv.style.marginBottom = '20px';
      messageDiv.style.padding = '15px';
      messageDiv.style.borderRadius = '8px';
      messageDiv.style.maxWidth = '100%';
      messageDiv.style.pageBreakInside = 'avoid'; // Prevent breaking inside messages
      messageDiv.style.overflow = 'hidden'; // Prevent content overflow
      
      // Style based on message type
      if (message.type === 'user') {
        messageDiv.style.backgroundColor = '#007bff';
        messageDiv.style.color = 'white';
        messageDiv.style.marginLeft = '100px';
        messageDiv.style.textAlign = 'right';
      } else if (message.type === 'assistant') {
        messageDiv.style.backgroundColor = '#f8f9fa';
        messageDiv.style.color = '#333';
        messageDiv.style.border = '1px solid #dee2e6';
        messageDiv.style.marginRight = '100px';
      } else if (message.type === 'error') {
        messageDiv.style.backgroundColor = '#f8d7da';
        messageDiv.style.color = '#721c24';
        messageDiv.style.border = '1px solid #f5c6cb';
        messageDiv.style.marginRight = '100px';
      } else {
        // Default styling for unknown message types
        messageDiv.style.backgroundColor = '#f8f9fa';
        messageDiv.style.color = '#333';
        messageDiv.style.border = '1px solid #dee2e6';
        messageDiv.style.marginRight = '100px';
      }
      
      // Add message content
      const contentDiv = document.createElement('div');
      contentDiv.style.whiteSpace = 'pre-wrap';
      contentDiv.style.wordWrap = 'break-word';
      contentDiv.style.maxWidth = '100%';
      
      if (message.isGraph && message.content) {
        // For graph messages, create an actual image element
        const imgElement = document.createElement('img');
        imgElement.src = message.content; // message.content contains the base64 image data
        imgElement.style.maxWidth = '100%';
        imgElement.style.height = 'auto';
        imgElement.style.borderRadius = '4px';
        imgElement.style.marginTop = '8px';
        imgElement.alt = 'Chart/Graph';
        
        // Preload the image to ensure it's available for PDF generation
        try {
          await preloadImage(message.content);
        } catch (error) {
          console.warn('Failed to preload image:', error);
          // Continue without the image if it fails to load
        }
        
        // Add a caption
        const captionDiv = document.createElement('div');
        captionDiv.textContent = 'Chart/Graph';
        captionDiv.style.fontSize = '12px';
        captionDiv.style.color = '#666';
        captionDiv.style.fontStyle = 'italic';
        captionDiv.style.marginTop = '4px';
        captionDiv.style.textAlign = 'center';
        
        contentDiv.appendChild(imgElement);
        contentDiv.appendChild(captionDiv);
      } else {
        // Handle text content
        const content = message.content || 'No content available';
        contentDiv.textContent = content;
      }
      
      messageDiv.appendChild(contentDiv);
      
      // Add timestamp
      const timeDiv = document.createElement('div');
      const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleString() : new Date().toLocaleString();
      timeDiv.textContent = timestamp;
      timeDiv.style.fontSize = '11px';
      timeDiv.style.opacity = '0.7';
      timeDiv.style.marginTop = '5px';
      messageDiv.appendChild(timeDiv);
      
      container.appendChild(messageDiv);
      
      // Update progress for message processing
      if (onProgress) {
        const messageProgress = 20 + (i / messages.length) * 30;
        onProgress(messageProgress, `Processing message ${i + 1} of ${messages.length}...`);
      }
    }
    
    // Add to document temporarily
    document.body.appendChild(container);
    
    if (onProgress) onProgress(50, 'Creating PDF document...');
    
    // Create PDF with intelligent page breaking
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 20; // 20mm margin on all sides
    const contentWidth = pdfWidth - (margin * 2);
    
    // Function to add page break
    const addPageBreak = () => {
      pdf.addPage();
      return margin; // Return to top of new page
    };
    
    // Function to check if element fits on current page with extra safety margin for graphs
    const checkElementFitsOnPage = (element, currentY, pageHeight, margin) => {
      const elementHeight = element.offsetHeight;
      const elementHeightMM = (elementHeight * 25.4) / 96; // Convert pixels to mm
      const hasGraph = element.getAttribute('data-has-graph') === 'true';
      
      // For graphs, add extra safety margin to ensure no truncation
      const safetyMargin = hasGraph ? 30 : 10; // Extra 30mm for graphs, 10mm for text
      
      return (currentY + elementHeightMM + safetyMargin) <= (pageHeight - margin);
    };
    
    // Process content with intelligent page breaking
    let currentY = margin;
    let pageNumber = 1;
    
    // Get all content elements
    const contentElements = container.querySelectorAll('[data-content-type]');
    
    for (let i = 0; i < contentElements.length; i++) {
      const element = contentElements[i];
      const contentType = element.getAttribute('data-content-type');
      const hasGraph = element.getAttribute('data-has-graph') === 'true';
      
      // Calculate element height in mm
      const elementHeightMM = getElementHeightMM(element);
      
      // Check if element fits on current page with extra safety for graphs
      if (!checkElementFitsOnPage(element, currentY, pdfHeight, margin)) {
        // Element doesn't fit, add page break
        currentY = addPageBreak();
        pageNumber++;
        
        if (onProgress) {
          const pdfProgress = 50 + (i / contentElements.length) * 40;
          onProgress(pdfProgress, `Starting new page for ${hasGraph ? 'graph' : 'content'}...`);
        }
      }
      
      try {
        // Create canvas for this element
        const elementCanvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: element.scrollWidth,
          height: element.scrollHeight,
          logging: false, // Disable logging for cleaner output
          removeContainer: false // Keep container for proper rendering
        });
        
        // Add element to PDF
        const imgData = elementCanvas.toDataURL('image/png');
        const imgWidth = contentWidth;
        const imgHeight = (elementCanvas.height * imgWidth) / elementCanvas.width;
        
        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        
        // Update current Y position with appropriate spacing
        let spacing = 10; // Default spacing
        if (contentType === 'title') {
          spacing = 15; // More space after title
        } else if (contentType === 'timestamp') {
          spacing = 20; // More space after timestamp
        } else if (contentType === 'message') {
          spacing = hasGraph ? 25 : 15; // More space after graphs
        }
        
        currentY += imgHeight + spacing;
        
        // Update progress for PDF generation
        if (onProgress) {
          const pdfProgress = 50 + (i / contentElements.length) * 40;
          onProgress(pdfProgress, `Generating page ${pageNumber}...`);
        }
      } catch (error) {
        console.warn(`Failed to process element ${i}:`, error);
        // Continue with next element if one fails
        continue;
      }
    }
    
    // Remove temporary container
    document.body.removeChild(container);
    
    if (onProgress) onProgress(90, 'Finalizing PDF...');
    
    // Save the PDF
    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(filename);
    
    if (onProgress) onProgress(100, 'PDF generated successfully!');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

/**
 * Generate markdown content from chat messages
 * @param {Array} messages - Array of chat messages
 * @param {string} title - Title for the markdown
 * @returns {string} Markdown content
 */
export const generateChatMarkdown = (messages, title = 'Chat History') => {
  let markdown = `# ${title}\n\n`;
  markdown += `Generated on: ${new Date().toLocaleString()}\n\n`;
  markdown += `---\n\n`;
  
  messages.forEach((message, index) => {
    const timestamp = new Date(message.timestamp).toLocaleString();
    
    if (message.type === 'user') {
      markdown += `### 👤 User (${timestamp})\n\n`;
      markdown += `${message.content}\n\n`;
    } else if (message.type === 'assistant') {
      markdown += `### 🤖 Assistant (${timestamp})\n\n`;
      if (message.isGraph) {
        // For graph messages, include the base64 image in markdown
        markdown += `![Chart/Graph](${message.content})\n\n`;
      } else {
        markdown += `${message.content}\n\n`;
      }
    } else if (message.type === 'error') {
      markdown += `### ❌ Error (${timestamp})\n\n`;
      markdown += `${message.content}\n\n`;
    }
    
    markdown += `---\n\n`;
  });
  
  return markdown;
};

/**
 * Download markdown content as a file
 * @param {string} markdown - Markdown content
 * @param {string} title - Title for the file
 */
export const downloadMarkdown = (markdown, title = 'Chat History') => {
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.md`;
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}; 
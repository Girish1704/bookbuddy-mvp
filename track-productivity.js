const fs = require('fs');
const path = require('path');

// Path to the log file
const logFilePath = path.join(__dirname, 'copilot-log.json');

// Function to log a suggestion
function logSuggestion(suggestionType, accepted) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    suggestionType,
    accepted,
  };

  // Read existing log file
  const logData = JSON.parse(fs.readFileSync(logFilePath, 'utf8'));
  logData.push(logEntry);

  // Write updated log file
  fs.writeFileSync(logFilePath, JSON.stringify(logData, null, 2));
  console.log('✅ Suggestion logged:', logEntry);
}

// Function to calculate time saved
function calculateTimeSaved() {
  const logData = JSON.parse(fs.readFileSync(logFilePath, 'utf8'));
  const timePerSuggestion = 5; // Estimated time saved per accepted suggestion (in minutes)

  const acceptedSuggestions = logData.filter(entry => entry.accepted);
  const totalTimeSaved = acceptedSuggestions.length * timePerSuggestion;

  console.log(`🕒 Total time saved: ${totalTimeSaved} minutes`);
  return totalTimeSaved;
}

// Function to generate weekly report
function generateWeeklyReport() {
  const logData = JSON.parse(fs.readFileSync(logFilePath, 'utf8'));
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const weeklyData = logData.filter(entry => new Date(entry.timestamp) >= oneWeekAgo);
  const acceptedCount = weeklyData.filter(entry => entry.accepted).length;
  const rejectedCount = weeklyData.length - acceptedCount;

  console.log('📊 Weekly Productivity Report:');
  console.log(`- Accepted Suggestions: ${acceptedCount}`);
  console.log(`- Rejected Suggestions: ${rejectedCount}`);
  console.log(`- Total Time Saved: ${acceptedCount * 5} minutes`);
}

// Example usage
// logSuggestion('Code Completion', true);
// logSuggestion('Code Refactoring', false);
// calculateTimeSaved();
// generateWeeklyReport();
import functions from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';

const express = require('express');
const ExcelJS = require('exceljs');

const app = express();

app.get('/download-excel', async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('UserActivity');

    const db = getFirestore()
    const logsRefs = db.collection('logs');
    const snapshot = await logsRefs.get();
    const documents = snapshot.docs;
    
    // Populate the worksheet with data from Firestore
    documents.forEach((doc, index) => {
    const data = doc.data();
    
    worksheet.addRow([data.itemVisited, data.teamMember, data.timeOfAction, data.userId]);
    });

    // Send the workbook as a response with appropriate headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=users.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating Excel file:', error);
    res.status(500).send('Error generating Excel file');
  }
});

// Export the Express app as a Firebase Cloud Function
exports.api = functions.https.onRequest(app);

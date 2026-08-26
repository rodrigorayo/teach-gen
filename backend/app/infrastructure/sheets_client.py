import os
import json
import gspread
from google.oauth2.service_account import Credentials

def get_gspread_client():
    scopes = ["https://www.googleapis.com/auth/spreadsheets"]
    
    creds_json = os.environ.get("GOOGLE_CREDENTIALS_JSON")
    if creds_json:
        creds_dict = json.loads(creds_json)
        creds = Credentials.from_service_account_info(creds_dict, scopes=scopes)
    else:
        # Fallback to local file for dev
        creds = Credentials.from_service_account_file("google_credentials.json", scopes=scopes)
        
    return gspread.authorize(creds)

def sync_attendance_to_sheet(sheet_id: str, tab_name: str, session_date_str: str, attendances_data: list):
    """
    session_date_str: 'YYYY-MM-DD'
    attendances_data: [{'student_name': 'ARMENGOL BRAVO DANIEL', 'status': 'P'}]
    """
    client = get_gspread_client()
    sh = client.open_by_key(sheet_id)
    ws = sh.worksheet(tab_name)
    
    # Format DB date '2026-08-25' to '25/08'
    parts = session_date_str.split('-')
    if len(parts) == 3:
        target_date = f"{parts[2]}/{parts[1]}"
    else:
        target_date = session_date_str
        
    # Read row 5 to find the date column
    row5 = ws.row_values(5)
    col_idx = None
    for i, val in enumerate(row5):
        if val == target_date:
            col_idx = i + 1 # 1-based index for gspread
            break
            
    if not col_idx:
        raise ValueError(f"No se encontró la columna con la fecha {target_date} en la fila 5.")
        
    # Read column B (2) to find student rows (starting from row 6)
    colB = ws.col_values(2)
    
    # We will do a batch update to save API calls
    cells_to_update = []
    
    for att in attendances_data:
        student_name = att['student_name'].strip().upper()
        status = att['status']
        
        # Find row for student
        row_idx = None
        for i, val in enumerate(colB):
            if val.strip().upper() == student_name:
                row_idx = i + 1 # 1-based index
                break
                
        if row_idx:
            # We found the cell: (row_idx, col_idx)
            # Create a Cell object for batch update
            cells_to_update.append(gspread.Cell(row=row_idx, col=col_idx, value=status))
            
    if cells_to_update:
        ws.update_cells(cells_to_update)
        
    return len(cells_to_update)

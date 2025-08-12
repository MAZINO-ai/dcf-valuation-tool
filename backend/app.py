from flask import Flask, jsonify, request
from flask_cors import CORS

# Initialize the Flask app
app = Flask(__name__)
CORS(app)

# --- Helper function for the core DCF calculation ---
def perform_dcf_calculation(data):
    """
    This helper function contains the core DCF logic. 
    It can be reused by the main endpoint and the sensitivity analysis.
    """
    # Get variables from the input data dictionary
    current_revenue = float(data.get('currentRevenue', 0))
    growth_rate = float(data.get('growthRate', 0)) / 100
    ebitda_margin = float(data.get('ebitdaMargin', 0)) / 100
    tax_rate = float(data.get('taxRate', 0)) / 100
    capex_rate = float(data.get('capexRate', 0)) / 100
    d_a_rate = float(data.get('dA_Rate', 0)) / 100
    nwc_rate = float(data.get('nwcRate', 0)) / 100
    
    wacc = float(data.get('wacc', 0)) / 100
    terminal_growth_rate = float(data.get('terminalGrowthRate', 0)) / 100
    
    shares_outstanding = float(data.get('sharesOutstanding', 1))
    cash = float(data.get('cash', 0))
    debt = float(data.get('debt', 0))
    
    projection_years = 5
    
    # --- Calculation Logic (same as before) ---
    free_cash_flows = []
    projected_revenue = current_revenue
    for year in range(1, projection_years + 1):
        projected_revenue *= (1 + growth_rate)
        ebitda = projected_revenue * ebitda_margin
        d_and_a = projected_revenue * d_a_rate
        ebit = ebitda - d_and_a
        taxes = ebit * tax_rate
        nopat = ebit - taxes
        capex = projected_revenue * capex_rate
        change_in_nwc = (projected_revenue - (projected_revenue / (1 + growth_rate))) * nwc_rate
        fcf = nopat + d_and_a - capex - change_in_nwc
        free_cash_flows.append(fcf)

    final_year_fcf = free_cash_flows[-1]
    # Basic check to prevent division by zero
    if wacc <= terminal_growth_rate:
        terminal_growth_rate = wacc - 0.001 # Ensure wacc > terminal growth

    terminal_value = (final_year_fcf * (1 + terminal_growth_rate)) / (wacc - terminal_growth_rate)
    
    discounted_fcf = []
    for i, fcf in enumerate(free_cash_flows):
        discounted_fcf.append(fcf / ((1 + wacc) ** (i + 1)))
        
    discounted_terminal_value = terminal_value / ((1 + wacc) ** projection_years)
    
    enterprise_value = sum(discounted_fcf) + discounted_terminal_value
    equity_value = enterprise_value - debt + cash
    intrinsic_value_per_share = equity_value / shares_outstanding
    
    return round(intrinsic_value_per_share, 2)


# --- Main API endpoint ---
@app.route('/api/dcf', methods=['POST'])
def handle_dcf_request():
    data = request.get_json()
    
    # 1. Calculate the base intrinsic value
    base_intrinsic_value = perform_dcf_calculation(data.copy())
    
    # 2. Perform Sensitivity Analysis
    sensitivity_table = []
    wacc_base = float(data['wacc'])
    terminal_growth_base = float(data['terminalGrowthRate'])

    # Define the range for the sensitivity table (e.g., 5x5 grid)
    wacc_range = [wacc_base - 1, wacc_base - 0.5, wacc_base, wacc_base + 0.5, wacc_base + 1]
    growth_rate_range = [terminal_growth_base - 0.5, terminal_growth_base - 0.25, terminal_growth_base, terminal_growth_base + 0.25, terminal_growth_base + 0.5]
    
    # Create the table row by row
    for wacc_val in wacc_range:
        row = []
        for growth_val in growth_rate_range:
            # Create a copy of the original data to modify
            temp_data = data.copy()
            temp_data['wacc'] = wacc_val
            temp_data['terminalGrowthRate'] = growth_val
            
            # Calculate the value for this specific combination
            calculated_value = perform_dcf_calculation(temp_data)
            row.append(calculated_value)
        sensitivity_table.append(row)
        
    # 3. Return all results
    return jsonify({
        'intrinsicValue': base_intrinsic_value,
        'sensitivityAnalysis': {
            'wacc_headers': [f"{w:.2f}%" for w in wacc_range],
            'growth_headers': [f"{g:.2f}%" for g in growth_rate_range],
            'table': sensitivity_table
        }
    })

# Healthcheck endpoint remains the same
@app.route('/api/healthcheck', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Backend is running!"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
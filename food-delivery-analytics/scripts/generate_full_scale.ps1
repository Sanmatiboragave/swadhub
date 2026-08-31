<#
PowerShell helper to run the generator at full scale. Edit counts as needed.
This script only calls the existing generator script with recommended batch sizes.
Estimate: 100k orders generation on this machine may take ~5-15 minutes depending on CPU.
#>

$python = "C:/Users/DELL/AppData/Local/Programs/Python/Python313/python.exe"
$script = "food-delivery-analytics/scripts/generate_raw_data.py"

# Example full-scale targets — adjust based on disk/CPU
$args = "--customers 10000 --restaurants 500 --food 2000 --orders 100000 --reviews 50000 --image_searches 20000"

Write-Host "Running full-scale generator (estimate: minutes to tens of minutes)"
& $python $script $args

Write-Host "When complete, run: `python food-delivery-analytics/scripts/data_cleaning.py` and `python food-delivery-analytics/scripts/data_cleaning_extended.py` to produce cleaned and sql-ready outputs."

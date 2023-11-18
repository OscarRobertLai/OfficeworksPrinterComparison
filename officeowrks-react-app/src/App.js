import './App.css';
import {Line} from 'react-chartjs-2';
import 'chart.js/auto';
import {useState} from "react";
import {niceNum} from "chart.js/helpers";


const PrinterSearch = ({ setChartData, setApiResponse, setStockInfo }) => {
    const [printer1Sku, setPrinter1Sku] = useState("");
    const [printer2Sku, setPrinter2Sku] = useState("");
    const [pricePerPage, setPricePerPage] = useState({ printer1: 0, printer2: 0 });
    const [printerCost, setPrinterCost] = useState({ printer1: 0, printer2: 0 });

    const findIntersectionPoint = (line1, line2) => {
        if (line1.m === line2.m) {
            if (line1.b === line2.b) {
                return 'The lines are coincident (identical).';
            }
            return 'The lines are parallel and do not intersect.';
        }

        // Calculate x coordinate of the intersection point
        const x = (line2.b - line1.b) / (line1.m - line2.m);

        // Calculate y coordinate using one of the equations
        const y = line1.m * x + line1.b;

        return { x, y };
    }

    const updateGraph = () =>
    {
        // const printer1Equation = { m: pricePerPage.printer1 b: }

    }

    const calculatePricePerPage = (data) => {
        // console.log(data)
        const sheetsData = data.specs.find(specGroup => specGroup.group === 'Performance');
        const edlpPrice = parseInt(data.attributes.find(attr => attr.id === 'edlpPrice').value);
        let estimatedSheets = 0;
        sheetsData.attributes.forEach(attribute => { // Can be done better
            estimatedSheets = parseInt(attribute.value.split(' ')[0]);
        });
        return edlpPrice / estimatedSheets;

    };

    const handleSearch = async (event) => {
        event.preventDefault(); // Prevent the form from submitting traditionally
        let pricePerPage1 = 0;
        let pricePerPage2 = 0;
        // Add these lines to print the values to the console
        Promise.all([
            fetch(`/catalogue-app/api/mobile-plan/product?productSku=BRLC3319P4`)
                .then(response => response.ok ? response.json() : Promise.reject(`Error: ${response.status}`)),
            fetch(`/catalogue-app/api/mobile-plan/product?productSku=BRTN2450`)
                .then(response => response.ok ? response.json() : Promise.reject(`Error: ${response.status}`)),
            fetch(`https://api.officeworks.com.au/v2/availability/store/W308?partNumber=BRLC3319P4`)
                .then(response => response.ok ? response.json() : Promise.reject(`Error: ${response.status}`)),
            fetch(`https://api.officeworks.com.au/v2/availability/store/W308?partNumber=BRTN2450`)
                .then(response => response.ok ? response.json() : Promise.reject(`Error: ${response.status}`))
        ]).then(([data1, data2, stockData1, stockData2]) => {
            const stock1 = stockData1[0].options[0].qty;
            const stock2 = stockData2[0].options[0].qty;
            const printer1Cost = data1
            console.log(printer1Cost)
            setPricePerPage({printer1: calculatePricePerPage(data1), printer2: calculatePricePerPage(data2)});
            setApiResponse({ printer1: data1, printer2: data2 });
            setStockInfo({printer1: stock1, printer2: stock2});
            // setPrinterCost({printer1: })
        }).catch(error => {
            console.error('There was an error fetching printer data:', error);
        });

        setChartData({
            labels: ['Data Point 1', 'Data Point 2'], // Example labels
            datasets: [
                {
                    label: 'Dataset 1',
                    data: [42, 16], // Use actual data points here
                    // ...other dataset properties...
                }
            ]
        });
    };

    return(
        <form onSubmit={handleSearch}>
            <h1>Compare Printers</h1>
            <div style={{ marginBottom: '10px' }}>
                <input
                    type="text"
                    placeholder="Printer 1"
                    value={printer1Sku}
                    onChange={(e) => setPrinter1Sku(e.target.value)}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <input
                    type="text"
                    placeholder="Printer 2"
                    value={printer2Sku}
                    onChange={(e) => setPrinter2Sku(e.target.value)}
                />
            </div>
            <div>
                <button type="submit">Compare</button>
            </div>
        </form>
    );
};

const PrinterInfoTable = ({ apiResponse, stockInfo }) =>
{


    const searchJSON = (response, searchItem) => {
        if (response != null) {
            const foundItem = response.attributes.find(obj => obj.id === searchItem);
            return foundItem ? foundItem.value : "N/A";
        }
        return "N/A";
    };

    return (
        <table>
            <thead>
            <tr>
                <th></th> {/* Empty cell for the corner */}
                <th>Printer 1</th>
                <th>Printer 2</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <th>Skew</th>
                <td>{searchJSON(apiResponse.printer1, 'productCode')}</td>
                <td>{searchJSON(apiResponse.printer2, 'productCode')}</td>
            </tr>
            <tr>
                <th>Price</th>
                <td>{searchJSON(apiResponse.printer1, 'edlpPrice')}</td>
                <td>{searchJSON(apiResponse.printer2, 'edlpPrice')}</td>
            </tr>
            <tr>
                <th>Brand</th>
                <td>{searchJSON(apiResponse.printer1, 'brand')}</td>
                <td>{searchJSON(apiResponse.printer2, 'brand')}</td>
            </tr>
            <tr>
                <th>Highett Stock</th>
                <td>{stockInfo.printer1}</td>
                <td>{stockInfo.printer2}</td>
            </tr>
            </tbody>
        </table>
    );
}

const LineChart = ({ data }) => {
    return <Line data={data} options={{/* ... */}} />;
};

export default function App() {

    const [apiResponse, setApiResponse] = useState({ printer1: null, printer2: null });
    const [stockInfo, setStockInfo] = useState({ printer1: "N/A", printer2: "N/A" });
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: '50%' }}>
                {/* Pass setApiResponse and setChartData as props to PrinterSearch */}
                <PrinterSearch setChartData={setChartData} setApiResponse={setApiResponse} setStockInfo={setStockInfo}/>
                {/* Pass apiResponse as prop to PrinterInfoTable */}
                <div style={{ marginTop: '20px' }}>
                    <PrinterInfoTable apiResponse={apiResponse} stockInfo={stockInfo}/>
                </div>
            </div>
            <div style={{ width: '50%' }}>
                <LineChart data={chartData} />
            </div>
        </div>
    );
}






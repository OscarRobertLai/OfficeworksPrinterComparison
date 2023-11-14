import './App.css';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import {useState} from "react";



const PrinterSearch = ({ setChartData, setApiResponse }) => {
    const [printer1Sku, setPrinter1Sku] = useState("");
    const [printer2Sku, setPrinter2Sku] = useState("");

    // Function to log Compatibility values
    const logCompatibilityValues = (data) => {

        const compatibilitySpecs = data.specs.find(specGroup => specGroup.group === 'Performance');
        console.log(compatibilitySpecs)
        if (compatibilitySpecs) {
            compatibilitySpecs.attributes.forEach(attribute => {
                console.log("VALUE", attribute.value);
                const estimatedSheets = attribute.value.split(' ')[0];
                console.log("SAMPLE", parseInt(estimatedSheets));


            });
        } else {
            console.log('No Compatibility specs found');
        }
    };

    const handleSearch = async (event) => {
        event.preventDefault(); // Prevent the form from submitting traditionally

        // Add these lines to print the values to the console
        Promise.all([
            fetch(`/catalogue-app/api/mobile-plan/product?productSku=BRLC3319P4`)
                .then(response => response.ok ? response.json() : Promise.reject(`Error: ${response.status}`)),
            fetch(`/catalogue-app/api/mobile-plan/product?productSku=BRTN2450`)
                .then(response => response.ok ? response.json() : Promise.reject(`Error: ${response.status}`))
        ]).then(([data1, data2]) => {
            setApiResponse({ printer1: data1, printer2: data2 });
            //
            // console.log("CATS", data1)
            // Log Compatibility values for each printer
            // logCompatibilityValues(data1);
            logCompatibilityValues(data2);
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

const PrinterInfoTable = ({ apiResponse }) => {

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
                <td>Skew</td>
                <td>{apiResponse.printer1 && apiResponse.printer1.sku ? apiResponse.printer1.sku : 'N/A'}</td> {/* Display SKU for Printer 1 */}
                <td>{apiResponse.printer2 && apiResponse.printer2.sku ? apiResponse.printer2.sku : 'N/A'}</td> {/* Display SKU for Printer 1 */}
            </tr>
            <tr>
                <td>Price</td>
                <td>
                    {
                        apiResponse.printer1 && apiResponse.printer1.attributes
                            ? (apiResponse.printer1.attributes.find(attr => attr.id === 'edlpPrice')?.value || 'N/A')
                            : 'N/A'
                    }
                </td>
                <td>
                    {
                        apiResponse.printer2 && apiResponse.printer2.attributes
                            ? (apiResponse.printer2.attributes.find(attr => attr.id === 'edlpPrice')?.value || 'N/A')
                            : 'N/A'
                    }
                </td> {/* Display EDLP Price for Printer 1 */}
            </tr>
            <tr>
                <td>Brand</td>
                <td>
                {
                    apiResponse.printer1 && apiResponse.printer1.attributes
                        ? (apiResponse.printer1.attributes.find(attr => attr.id === 'brand')?.value || 'N/A')
                        : 'N/A'
                }
                </td> {/* Display EDLP Price for Printer 1 */}
                <td>
                    {
                        apiResponse.printer2 && apiResponse.printer2.attributes
                            ? (apiResponse.printer2.attributes.find(attr => attr.id === 'brand')?.value || 'N/A')
                            : 'N/A'
                    }
                </td> {/* Display EDLP Price for Printer 1 */}
            </tr>
            <tr>
                <td>Highett Stock</td>
                <td></td> {/* Empty cell for Printer 1's Highett Stock */}
                <td></td> {/* Empty cell for Printer 2's Highett Stock */}
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
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: '50%' }}>
                {/* Pass setApiResponse and setChartData as props to PrinterSearch */}
                <PrinterSearch setChartData={setChartData} setApiResponse={setApiResponse}/>
                {/* Pass apiResponse as prop to PrinterInfoTable */}
                <div style={{ marginTop: '20px' }}>
                    <PrinterInfoTable apiResponse={apiResponse} />
                </div>
            </div>
            <div style={{ width: '50%' }}>
                <LineChart data={chartData} />
            </div>
        </div>
    );
}






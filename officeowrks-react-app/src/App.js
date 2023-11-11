import './App.css';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import {useState} from "react";



const PrinterSearch = () => {
    const [printer1Sku, setPrinter1Sku] = useState("");
    const [printer2Sku, setPrinter2Sku] = useState("");
    const [apiResponse, setApiResponse] = useState({ printer1: null, printer2: null });

    const handleSearch = async (event) => {
        event.preventDefault(); // Prevent the form from submitting traditionally

        // Add these lines to print the values to the console
        console.log("Printer 1 SKU:", printer1Sku);
        console.log("Printer 2 SKU:", printer2Sku);


        Promise.all([
            fetch('/catalogue-app/api/mobile-plan/product?productSku=BRMFCL3750')
                .then(response => response.ok ? response.json() : Promise.reject(`Error: ${response.status}`)),
            fetch('/catalogue-app/api/mobile-plan/product?productSku=BRMFCL3750')
                .then(response => response.ok ? response.json() : Promise.reject(`Error: ${response.status}`))
        ]).then(([data1, data2]) => {
            setApiResponse({ printer1: data1, printer2: data2 });
        }).catch(error => {
            console.error('There was an error fetching printer data:', error);
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
            {apiResponse && (
                <div>
                    <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
                </div>
            )}
        </form>
    );
};

const PrinterInfoTable = () => {
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
                <td></td> {/* Empty cell for Printer 1's Skew */}
                <td></td> {/* Empty cell for Printer 2's Skew */}
            </tr>
            <tr>
                <td>Price</td>
                <td></td> {/* Empty cell for Printer 1's Price */}
                <td></td> {/* Empty cell for Printer 2's Price */}
            </tr>
            <tr>
                <td>Brand</td>
                <td></td> {/* Empty cell for Printer 1's Brand */}
                <td></td> {/* Empty cell for Printer 2's Brand */}
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

const LineChart = () => {
    const data = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [
            {
                label: 'Dataset 1',
                data: [65, 59, 80, 81, 56, 55],
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }
        ]
    };

    const options = {
        // Add any Chart.js options you need here
    };

    return <Line data={data} options={options} />;
};

export default function App() {
    // const [filterText, setFilterText] = useState("")

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: '50%' }}>
                <PrinterSearch />
                <div style={{ marginTop: '20px' }}>
                    <PrinterInfoTable />
                </div>
            </div>
            <div style={{ width: '50%' }}>
                <LineChart />
            </div>
        </div>
    );
}


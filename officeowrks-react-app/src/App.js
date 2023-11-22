import './App.css';
import {Line} from 'react-chartjs-2';
import 'chart.js/auto';
import {useEffect, useState} from "react";
import { findIntersectionPoint, calculatePricePerPage } from './printerUtils';

const PrinterSearch = ({ setChartData, setApiResponse, setStockInfo, stockInfo }) => {
    const [printer1Sku, setPrinter1Sku] = useState("");
    const [printer2Sku, setPrinter2Sku] = useState("");
    const [printerPricing1, setPrinterPricing1] = useState("300");
    const [printerPricing2, setPrinterPricing2] = useState("300");
    const [pricePerPage, setPricePerPage] = useState({ printer1: 0, printer2: 0 });
    console.log("INITIALISED")

    // useEffect hook
    useEffect(() => {
        if (stockInfo.printer1 !== 'N/A' && stockInfo.printer2 !== 'N/A' )
        {
            updateGraph()
        }
    }, [stockInfo]);

    const updateGraph = () =>
    {
        let points = []
        let dataSet1 = []
        let dataSet2 = []

        const printer1Equation = { m: pricePerPage.printer1, b: parseFloat(printerPricing1) };
        const printer2Equation = { m: pricePerPage.printer2, b: parseFloat(printerPricing2) };
        const intersectionResult = findIntersectionPoint(printer1Equation, printer2Equation);

        if (intersectionResult != null || intersectionResult < 0)
        {
            const midPoint = intersectionResult.x;
            let factor = 0.5;
            for (let i = 0; i < 5; i++){
                // X labels
                let value = midPoint * factor;
                let intPoint = parseInt(value)
                points.push(intPoint);
                factor += 0.25;

                // Printer 1 Points
                const point1Push = (intPoint * pricePerPage.printer1) + parseInt(printerPricing1)
                dataSet1.push(point1Push);

                 // Printer 2 Points
                const point2Push = (intPoint * pricePerPage.printer2) + parseInt(printerPricing2)
                dataSet2.push(point2Push);
                console.log(point1Push, point2Push)
            }
            console.log(dataSet1, dataSet2)
        }else{
            console.log("LOGGED", intersectionResult)
            let value = 150;
            let factor = 0.5;
            for (let i = 0; i < 5; i++){
                // X labels
                const point = value * factor
                points.push(point);
                factor += 0.25;
                dataSet1.push(point * pricePerPage.printer1 + parseInt(printerPricing1))
                dataSet2.push(point * pricePerPage.printer2 + parseInt(printerPricing2))
            }
        }
        setChartData({
            labels: points, // Example labels
            datasets: [
                {
                    label: 'Dataset 1',
                    data: dataSet1, // Use actual data points here
                    // ...other dataset properties...
                },
                {
                    label: 'Dataset 2',
                    data: dataSet2, // Use actual data points here
                }
            ]
        });
    }

    const handleSearch = async (event) => {

        event.preventDefault(); // Prevent the form from submitting traditionally

        // Add these lines to print the values to the console
        Promise.all([
            fetch(`/catalogue-app/api/mobile-plan/product?productSku=BRLC33174P`)
                .then(response => response.ok ? response.json() : Promise.reject(`Error: ${response.status}`)),
            fetch(`/catalogue-app/api/mobile-plan/product?productSku=BRLC3319P4`)
                .then(response => response.ok ? response.json() : Promise.reject(`Error: ${response.status}`)),
            fetch(`https://api.officeworks.com.au/v2/availability/store/W308?partNumber=BRLC33174P`)
                .then(response => response.ok ? response.json() : Promise.reject(`Error: ${response.status}`)),
            fetch(`https://api.officeworks.com.au/v2/availability/store/W308?partNumber=BRLC3319P4`)
                .then(response => response.ok ? response.json() : Promise.reject(`Error: ${response.status}`))
        ]).then(async ([data1, data2, stockData1, stockData2]) => {
            console.log("LOGGING", data1)
            const stock1 = stockData1[0].options[0].qty;
            const stock2 = stockData2[0].options[0].qty;
            // let printerData1 = await calculatePricePerPage(data1)
            // let printerData2 = await calculatePricePerPage(data2)
            // console.log("DATA", printerData1)
            setPricePerPage({printer1: calculatePricePerPage(data1), printer2: calculatePricePerPage(data2)});
            setApiResponse({printer1: data1, printer2: data2});
            setStockInfo({printer1: stock1, printer2: stock2});

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
                    placeholder="Ink 1 Skew"
                    value={printer1Sku}
                    onChange={(e) => setPrinter1Sku(e.target.value)}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <input
                    type="text"
                    placeholder="Ink 2 Skew"
                    value={printer2Sku}
                    onChange={(e) => setPrinter2Sku(e.target.value)}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <input
                    type="text"
                    placeholder="Printer Price 1"
                    value={printerPricing1.printer1}
                    onChange={(e) => setPrinterPricing1(e.target.value)}

                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <input
                    type="text"
                    placeholder="Printer Price 2"
                    value={printerPricing2.printer2}
                    onChange={(e) => setPrinterPricing2(e.target.value)}
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
                <PrinterSearch setChartData={setChartData} setApiResponse={setApiResponse} setStockInfo={setStockInfo} stockInfo={stockInfo}/>
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






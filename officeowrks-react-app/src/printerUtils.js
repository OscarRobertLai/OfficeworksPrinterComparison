
export const findIntersectionPoint = (line1, line2) => {
    console.log("CATING", line1.m, line1.b, line2.m, line2.b)

    if (line1.m === line2.m) {
        if (line1.b === line2.b) {
            return null;
        }
        return null;
    }

    // Calculate x coordinate of the intersection point
    const x = (line2.b - line1.b) / (line1.m - line2.m);

    // Calculate y coordinate using one of the equations
    const y = line1.m * x + line1.b;
    // console.log("GETING HERE", x, y)
    // Check if the intersection point is in the desired range
    if (x > 0 && y > 0) {
        return { x, y };
    } else {
        return null;
    }
}

export const calculatePricePerPage = (data) => {
    const sheetsData = data.specs.find(specGroup => specGroup.group === 'Performance');
    const edlpPrice = parseInt(data.attributes.find(attr => attr.id === 'edlpPrice').value);
    let estimatedSheets = 0;
    sheetsData.attributes.forEach(attribute => { // Can be done better
        estimatedSheets = parseInt(attribute.value.split(' ')[0]);
    });
    return edlpPrice / estimatedSheets;
};

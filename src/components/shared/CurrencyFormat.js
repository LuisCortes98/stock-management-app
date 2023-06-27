export const CurrencyFormat = ({ value, currency }) => {

    const formattedValue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(value);

    return <span>{formattedValue}</span>;
    
};
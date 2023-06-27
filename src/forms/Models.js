import { Schema } from 'rsuite';

export const account = Schema.Model({
    name: Schema.Types.StringType().isRequired(),
    id: Schema.Types.NumberType().isRequired(),
    phone: Schema.Types.NumberType().isRequired(),
    address: Schema.Types.StringType().isRequired()
});

export const product = Schema.Model({
    name: Schema.Types.StringType().isRequired(),
    quantity: Schema.Types.NumberType().isRequired(),
    price: Schema.Types.NumberType().isRequired(),
    description: Schema.Types.StringType().isRequired()
});
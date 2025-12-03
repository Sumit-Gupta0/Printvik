const mongoose = require('mongoose');

const globalSettingsSchema = new mongoose.Schema({
    surgePricing: {
        enabled: { type: Boolean, default: false },
        multiplier: { type: Number, default: 1.0 }
    },
    deliveryRules: {
        baseFare: { type: Number, default: 30 },
        baseDistance: { type: Number, default: 3 }, // km
        perKmRate: { type: Number, default: 10 }
    },
    tax: {
        gstRate: { type: Number, default: 18 } // %
    },
    // Platform Commission (Separate for Services and Products)
    platformFee: {
        services: {
            type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
            percentage: { type: Number, default: 10 },
            fixedAmount: { type: Number, default: 20 }
        },
        products: {
            type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
            percentage: { type: Number, default: 15 },
            fixedAmount: { type: Number, default: 50 }
        }
    },
    // Printing Rates
    printingRates: {
        // A4 Rates
        a4BWSingle: {
            base: { type: Number, default: 2.0 },   // 1-9 pages
            tier1: { type: Number, default: 1.8 },  // 10-29 pages
            tier2: { type: Number, default: 1.5 },  // 30-99 pages
            tier3: { type: Number, default: 1.2 }   // 100+ pages
        },
        a4BWDouble: {
            base: { type: Number, default: 3.0 },
            tier1: { type: Number, default: 2.8 },
            tier2: { type: Number, default: 2.5 },
            tier3: { type: Number, default: 2.0 }
        },
        a4ColorSingle: {
            base: { type: Number, default: 10.0 },
            tier1: { type: Number, default: 9.0 },
            tier2: { type: Number, default: 8.0 },
            tier3: { type: Number, default: 7.0 }
        },
        a4ColorDouble: {
            base: { type: Number, default: 18.0 },
            tier1: { type: Number, default: 16.0 },
            tier2: { type: Number, default: 14.0 },
            tier3: { type: Number, default: 12.0 }
        },
        // A3 Rates
        a3BWSingle: {
            base: { type: Number, default: 5.0 },
            tier1: { type: Number, default: 4.5 },
            tier2: { type: Number, default: 4.0 },
            tier3: { type: Number, default: 3.5 }
        },
        a3BWDouble: {
            base: { type: Number, default: 8.0 },
            tier1: { type: Number, default: 7.5 },
            tier2: { type: Number, default: 7.0 },
            tier3: { type: Number, default: 6.0 }
        },
        a3ColorSingle: {
            base: { type: Number, default: 20.0 },
            tier1: { type: Number, default: 18.0 },
            tier2: { type: Number, default: 16.0 },
            tier3: { type: Number, default: 14.0 }
        },
        a3ColorDouble: {
            base: { type: Number, default: 35.0 },
            tier1: { type: Number, default: 32.0 },
            tier2: { type: Number, default: 30.0 },
            tier3: { type: Number, default: 25.0 }
        },
        // Additional Services (Flat Rates)
        spiralBinding: { type: Number, default: 30 },
        hardBinding: { type: Number, default: 100 },
        laminationA4: { type: Number, default: 20 },
        laminationA3: { type: Number, default: 40 }
    },
    // Operator Base Rates (Cost to Platform)
    operatorBaseRates: {
        // A4 Rates
        a4BWSingle: {
            base: { type: Number, default: 1.0 },   // 1-9 pages
            tier1: { type: Number, default: 1.0 },  // 10-29 pages
            tier2: { type: Number, default: 0.9 },  // 30-99 pages
            tier3: { type: Number, default: 0.8 }   // 100+ pages
        },
        a4BWDouble: {
            base: { type: Number, default: 1.8 },
            tier1: { type: Number, default: 1.8 },
            tier2: { type: Number, default: 1.6 },
            tier3: { type: Number, default: 1.5 }
        },
        a4ColorSingle: {
            base: { type: Number, default: 5.0 },
            tier1: { type: Number, default: 5.0 },
            tier2: { type: Number, default: 4.5 },
            tier3: { type: Number, default: 4.0 }
        },
        a4ColorDouble: {
            base: { type: Number, default: 9.0 },
            tier1: { type: Number, default: 9.0 },
            tier2: { type: Number, default: 8.0 },
            tier3: { type: Number, default: 7.0 }
        },
        // A3 Rates
        a3BWSingle: {
            base: { type: Number, default: 3.0 },
            tier1: { type: Number, default: 2.0 },
            tier2: { type: Number, default: 1.5 },
            tier3: { type: Number, default: 1.0 }
        },
        a3BWDouble: {
            base: { type: Number, default: 5.0 },
            tier1: { type: Number, default: 4.0 },
            tier2: { type: Number, default: 3.0 },
            tier3: { type: Number, default: 2.0 }
        },
        a3ColorSingle: {
            base: { type: Number, default: 10.0 },
            tier1: { type: Number, default: 9.0 },
            tier2: { type: Number, default: 8.0 },
            tier3: { type: Number, default: 7.0 }
        },
        a3ColorDouble: {
            base: { type: Number, default: 18.0 },
            tier1: { type: Number, default: 16.0 },
            tier2: { type: Number, default: 14.0 },
            tier3: { type: Number, default: 12.0 }
        },
        // Additional Services (Flat Rates)
        spiralBinding: { type: Number, default: 15 },
        hardBinding: { type: Number, default: 60 },
        laminationA4: { type: Number, default: 8 },
        laminationA3: { type: Number, default: 16 }
    },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GlobalSettings', globalSettingsSchema);

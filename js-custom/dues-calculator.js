//TODO: Wechselkurse dynamisch laden (einmalig)
var EXCHANGE_RATIOS = [0.51125, 1.0, 0.43901, 0.61071]; // In der Reihenfolge der Currencies, https://themoneyconverter.com/BGN/EUR
var SOCIAL_SEC_EMPLOYEE_PCT = 0.1378;
var SOCIAL_SEC_EMPLOYER_PCT = 0.1892;
var TAX_PCT = 0.1000;
var MAX_SOCIAL_SEC_INCOME_BGN = 3000.00;
function onInteraction(view) {
    var model = view.Model;
    model.ExchangeRatio = EXCHANGE_RATIOS[model.Currency];
    var socialSecurityShares;
    var grossIncome;
    if (model.IncomeType == IncomeTypes.Revenue) {
        grossIncome = model.Income / (1 + SOCIAL_SEC_EMPLOYER_PCT);
        socialSecurityShares = CalculateSocialSecurity(grossIncome, model.ExchangeRatio);
        grossIncome = model.Income - socialSecurityShares.Employer;
    }
    else if (model.IncomeType == IncomeTypes.Payout) {
        var taxableIncome_1 = model.Income / (1 - TAX_PCT);
        grossIncome = taxableIncome_1 / (1 - SOCIAL_SEC_EMPLOYEE_PCT);
        socialSecurityShares = CalculateSocialSecurity(grossIncome, model.ExchangeRatio);
        grossIncome = taxableIncome_1 + socialSecurityShares.Employee;
    }
    model.TotalSocialSec = socialSecurityShares.Total;
    model.Revenue = grossIncome + socialSecurityShares.Employer;
    var taxableIncome = grossIncome - socialSecurityShares.Employee;
    model.TotalTaxes = taxableIncome * TAX_PCT;
    model.Payout = taxableIncome - model.TotalTaxes;
    view.Update(model);
}
var SocialSecurityShares = /** @class */ (function () {
    function SocialSecurityShares() {
    }
    Object.defineProperty(SocialSecurityShares.prototype, "Total", {
        get: function () {
            return this.Employee + this.Employer;
        },
        enumerable: false,
        configurable: true
    });
    return SocialSecurityShares;
}());
function CalculateSocialSecurity(grossIncome, exchangeRatio) {
    var socialSecIncome = grossIncome;
    var grossIncomeBGN = grossIncome / exchangeRatio;
    if (grossIncomeBGN > MAX_SOCIAL_SEC_INCOME_BGN)
        socialSecIncome = MAX_SOCIAL_SEC_INCOME_BGN * exchangeRatio;
    var socialSec = new SocialSecurityShares();
    socialSec.Employee = socialSecIncome * SOCIAL_SEC_EMPLOYEE_PCT;
    socialSec.Employer = socialSecIncome * SOCIAL_SEC_EMPLOYER_PCT;
    return socialSec;
}
/*
========== Model ==========
 */
var IncomeTypes;
(function (IncomeTypes) {
    IncomeTypes[IncomeTypes["Payout"] = 0] = "Payout";
    IncomeTypes[IncomeTypes["Revenue"] = 1] = "Revenue";
})(IncomeTypes || (IncomeTypes = {}));
var Currencies;
(function (Currencies) {
    Currencies[Currencies["EUR"] = 0] = "EUR";
    Currencies[Currencies["BGN"] = 1] = "BGN";
    Currencies[Currencies["GBP"] = 2] = "GBP";
    Currencies[Currencies["USD"] = 3] = "USD";
})(Currencies || (Currencies = {}));
var Model = /** @class */ (function () {
    function Model() {
        this.IncomeType = IncomeTypes.Revenue;
        this.Currency = Currencies.EUR;
        this.ExchangeRatio = EXCHANGE_RATIOS[Currencies.EUR];
        this.Payout = 0.0;
        this.Revenue = 0.0;
        this.TotalTaxes = 0.0;
        this.TotalSocialSec = 0.0;
    }
    return Model;
}());
/*
========== View ==========
 */
var CURRENCY_SYMBOLS = ["€", "лв", "£", "$"]; // Reihenfolge wie bei Currencies
var View = /** @class */ (function () {
    function View() {
        var _this = this;
        this.INCOME_TYPE_OPTIONS = ["payout", "revenue"];
        this.CURRENCY_OPTION = ["EUR", "BGN", "GBP", "USD"];
        this.sb_incomeType = document.getElementById("incometype");
        this.sb_incomeType.onchange = function () { return _this.OnChanged(_this); };
        this.tx_income = document.getElementById("income");
        // Bei jedem Tastendruck sofort die Kalkulation aktualisieren.
        // Allerdings muss einen Moment gewartet werden, bis die Veränderung in .value
        // angekommen ist.
        this.tx_income.onkeyup = function (e) {
            setTimeout(function () {
                var x = parseFloat(_this.tx_income.value);
                if (isNaN(x) == false)
                    _this.OnChanged(_this);
            }, 50);
        };
        // Auch wenn keine Veränderung vorgenommen wurde bei ENTER und Verlassen des Feldes
        // neu kalkulieren. (Das könnte evtl. auch weg.)
        this.tx_income.onchange = function () { return _this.OnChanged(_this); };
        this.tx_income.onkeypress = function (e) {
            if (e.key == "\n")
                _this.OnChanged(_this);
        };
        this.sb_currency = document.getElementById("currency");
        this.sb_currency.onchange = function () { return _this.OnChanged(_this); };
        this.lb_exchangeRatio = document.getElementById("exchangeratio");
        this.lb_payout = document.getElementById("payout");
        this.lb_totalTaxes = document.getElementById("totaltaxes");
        this.lb_totalSocialSec = document.getElementById("totalsocialsec");
        this.lb_revenue = document.getElementById("revenue");
    }
    Object.defineProperty(View.prototype, "Model", {
        get: function () {
            var model = new Model();
            model.IncomeType = this.IncomeType;
            model.Currency = this.Currency;
            var x = parseFloat(this.tx_income.value);
            model.Income = isNaN(x) ? 0.0 : x;
            return model;
        },
        enumerable: false,
        configurable: true
    });
    View.prototype.Update = function (model) {
        this.IncomeType = model.IncomeType;
        //this.tx_income.value = model.Income.toFixed(2);
        this.Currency = model.Currency;
        this.lb_exchangeRatio.innerText = "(1лв=" + model.ExchangeRatio.toFixed(5) + CURRENCY_SYMBOLS[model.Currency] + ")";
        this.lb_payout.innerText = model.Payout.toFixed(2) + CURRENCY_SYMBOLS[model.Currency];
        this.lb_totalTaxes.innerText = model.TotalTaxes.toFixed(2) + CURRENCY_SYMBOLS[model.Currency];
        this.lb_totalSocialSec.innerText = model.TotalSocialSec.toFixed(2) + CURRENCY_SYMBOLS[model.Currency];
        this.lb_revenue.innerText = model.Revenue.toFixed(2) + CURRENCY_SYMBOLS[model.Currency];
    };
    Object.defineProperty(View.prototype, "IncomeType", {
        get: function () {
            switch (this.sb_incomeType.value) {
                case this.INCOME_TYPE_OPTIONS[IncomeTypes.Payout]: return IncomeTypes.Payout;
                case this.INCOME_TYPE_OPTIONS[IncomeTypes.Revenue]: return IncomeTypes.Revenue;
            }
        },
        set: function (value) {
            this.sb_incomeType.value = this.INCOME_TYPE_OPTIONS[value];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(View.prototype, "Currency", {
        get: function () {
            switch (this.sb_currency.value) {
                case this.CURRENCY_OPTION[Currencies.EUR]: return Currencies.EUR;
                case this.CURRENCY_OPTION[Currencies.BGN]: return Currencies.BGN;
                case this.CURRENCY_OPTION[Currencies.GBP]: return Currencies.GBP;
                case this.CURRENCY_OPTION[Currencies.USD]: return Currencies.USD;
            }
        },
        set: function (value) {
            this.sb_currency.value = this.CURRENCY_OPTION[value];
        },
        enumerable: false,
        configurable: true
    });
    return View;
}());
/*
========== Construction/Run ==========
 */
var view = new View();
view.OnChanged = onInteraction;

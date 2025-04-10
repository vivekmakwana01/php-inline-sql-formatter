import { format } from 'sql-formatter'

const sql = 'select cc.sec_conv_rate from currency_master cm join currency_cat cc on cm.id = cc.ref_id where cm.local_currency = 1 and cc.rate_date <= :rate_date order by cc.id desc, cc.rate_date desc limit 1';

const formattedSql = format(sql, {
    language: 'mysql',
    keywordCase: 'upper',
    tabWidth: 4,
    paramTypes: {
        named: [':']
    }
});

console.log(formattedSql);
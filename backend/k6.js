import http from 'k6/http';
import { check, group } from 'k6';

export const options = {
    vus: 1,
    iterations: 1,
    duration: '20m',
};

// k6 run k6_test.js
export default function() {
    const baseURL = 'http://128.199.19.234:5000';
    const headers = { 'Content-Type': 'application/json' };

    // Login API
    let jwt;
    const TIMEOUT = 1200000;
    let params = {
        timeout: `${TIMEOUT}ms`
    };

    group('loginAPI', function() {
        const loginPayload = JSON.stringify({
            email: "venki@life9sys.com",
            password: "Venki@123",
        });
        const loginResponse = http.post(`${baseURL}/api/users/login`, loginPayload, { headers });
        check(loginResponse, { 'Login was successful': r => r.status === 200 });
        if (loginResponse.status === 200) {
            jwt = JSON.parse(loginResponse.body).message;
        } else {
            console.error(`Login failed. Status: ${loginResponse.status}, Body: ${loginResponse.body}`);
        }
    });
    

    const apiHeaders = {
        'access-token': `${jwt}`,
        'Content-Type': 'application/json',
    };

    // API: Get Dashboard Count
    group('getDashboardCount', function() {
        let response = http.get(`${baseURL}/api/dashboard/getdashboardcount`, { headers: apiHeaders, timeout: TIMEOUT });
        check(response, { 'Dashboard Count retrieval was successful': r => r.status === 200 });
        if (response.status !== 200) {
            console.log(`Failed to retrieve Dashboard Count. Status: ${response.status}, Body: ${response.body}`);
        }
    });

    // API: Get Low Stock Medicines
    group('getLowStockMedicines', function() {
        let response = http.get(`${baseURL}/api/dashboard/getlowstockmedicines`, { headers: apiHeaders, timeout: TIMEOUT });
        check(response, { 'Low Stock Medicines retrieval was successful': r => r.status === 200 });
        if (response.status !== 200) {
            console.log(`Failed to retrieve Low Stock Medicines. Status: ${response.status}, Body: ${response.body}`);
        }
    });

    // API: Get High Billing Users
    group('getHighBillingUsers', function() {
        let response = http.get(`${baseURL}/api/dashboard/gethighbillingusers`, { headers: apiHeaders, timeout: TIMEOUT });
        check(response, { 'High Billing Users retrieval was successful': r => r.status === 200 });
        if (response.status !== 200) {
            console.log(`Failed to retrieve High Billing Users. Status: ${response.status}, Body: ${response.body}`);
        }
    });
     // API: Get Billing
     group('getBilling', function() {
        let response = http.get(`${baseURL}/api/billing/get`, { headers: apiHeaders, timeout: TIMEOUT });
        check(response, { 'Billing retrieval was successful': r => r.status === 200 });
        if (response.status !== 200) {
            console.log(`Failed to retrieve Billing. Status: ${response.status}, Body: ${response.body}`);
        }
    });

    // API: Get Medicines
    group('getMedicines', function() {
        let response = http.get(`${baseURL}/api/medicines/getmedicines`, { headers: apiHeaders, timeout: TIMEOUT });
        check(response, { 'Medicines retrieval was successful': r => r.status === 200 });
        if (response.status !== 200) {
            console.log(`Failed to retrieve Medicines. Status: ${response.status}, Body: ${response.body}`);
        }
    });
}

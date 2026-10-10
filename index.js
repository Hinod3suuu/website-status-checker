const http = require("http");
const https = require("https");
const fs = require("fs");
const { performance } = require("perf_hooks");

// ========================================
// CONFIGURATION
// ========================================

const args = process.argv.slice(2);

const exportJSON = args.includes("--json");

const websites = args.filter((arg) => arg !== "--json");

const TIMEOUT = 5000;

// ========================================
// COMMAND-LINE HELP
// ========================================

if (websites.length === 0) {
    console.log("\n========================================");
    console.log("         WEBSITE STATUS CHECKER");
    console.log("========================================\n");

    console.log("Usage:");
    console.log("node index.js <website1> <website2> ... [--json]\n");

    console.log("Examples:");
    console.log("node index.js https://example.com");
    console.log("node index.js https://example.com https://github.com");
    console.log("node index.js https://example.com --json\n");

    process.exit(1);
}

// ========================================
// HTTP STATUS CLASSIFICATION
// ========================================

function getStatus(code) {
    if (code >= 200 && code < 300) {
        return "HEALTHY";
    }

    if (code >= 300 && code < 400) {
        return "REDIRECT";
    }

    if (code >= 400 && code < 500) {
        return "CLIENT ERROR";
    }

    if (code >= 500 && code < 600) {
        return "SERVER ERROR";
    }

    return "OTHER RESPONSE";
}

// ========================================
// WEBSITE CHECKING
// ========================================

function checkWebsite(url) {
    return new Promise((resolve) => {
        const startTime = performance.now();

        let parsedUrl;

        // Validate URL
        try {
            parsedUrl = new URL(url);

            if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                throw new Error("Only HTTP and HTTPS URLs are supported");
            }

            if (!parsedUrl.hostname) {
                throw new Error("A valid hostname is required");
            }

        } catch (error) {
            resolve({
                website: url,
                status: "INVALID URL",
                httpCode: "N/A",
                responseTime: "N/A",
                error: error.message
            });

            return;
        }

        const client = parsedUrl.protocol === "https:" ? https : http;

        let completed = false;
        let request;

        // Ensure each check resolves only once
        function finish(result) {
            if (completed) {
                return;
            }

            completed = true;
            clearTimeout(timer);
            resolve(result);
        }

        // Strict overall request deadline
        const timer = setTimeout(() => {
            const elapsed = Math.round(performance.now() - startTime);

            finish({
                website: url,
                status: "TIMEOUT",
                httpCode: "N/A",
                responseTime: `${elapsed} ms`,
                error: `Request exceeded ${TIMEOUT} ms`
            });

            if (request) {
                request.destroy();
            }

        }, TIMEOUT);

        try {
            request = client.get(parsedUrl, (response) => {
                const elapsed = Math.round(performance.now() - startTime);

                finish({
                    website: url,
                    status: getStatus(response.statusCode),
                    httpCode: response.statusCode,
                    responseTime: `${elapsed} ms`,
                    error: null
                });

                response.resume();
            });

            request.on("error", (error) => {
                const elapsed = Math.round(performance.now() - startTime);

                finish({
                    website: url,
                    status: "UNREACHABLE",
                    httpCode: "N/A",
                    responseTime: `${elapsed} ms`,
                    error: error.message
                });
            });

        } catch (error) {
            const elapsed = Math.round(performance.now() - startTime);

            finish({
                website: url,
                status: "UNREACHABLE",
                httpCode: "N/A",
                responseTime: `${elapsed} ms`,
                error: error.message
            });
        }
    });
}

// ========================================
// MAIN PROGRAM
// ========================================

async function main() {
    console.log("\n========================================");
    console.log("         WEBSITE STATUS CHECKER");
    console.log("========================================\n");

    console.log(`Checking ${websites.length} website(s)...\n`);

    // Run checks concurrently
    const results = await Promise.all(
        websites.map((website) => checkWebsite(website))
    );

    // Display results
    for (const result of results) {
        console.log("----------------------------------------");
        console.log(`Website:       ${result.website}`);
        console.log(`Status:        ${result.status}`);
        console.log(`HTTP Code:     ${result.httpCode}`);
        console.log(`Response Time: ${result.responseTime}`);

        if (result.error) {
            console.log(`Error:         ${result.error}`);
        }
    }

    // Summary
    console.log("\n========================================");
    console.log(`Total Websites: ${results.length}`);
    console.log(`Checked At:     ${new Date().toLocaleString()}`);
    console.log("========================================\n");

    // Optional JSON export
    if (exportJSON) {
        const report = {
            checkedAt: new Date().toISOString(),
            totalWebsites: results.length,
            timeoutMs: TIMEOUT,
            results: results
        };

        try {
            fs.writeFileSync(
                "results.json",
                JSON.stringify(report, null, 4),
                "utf8"
            );

            console.log("JSON report saved successfully: results.json\n");

        } catch (error) {
            console.error(`Failed to save JSON report: ${error.message}`);
            process.exitCode = 1;
        }
    }
}

// ========================================
// START PROGRAM
// ========================================

main().catch((error) => {
    console.error(`Unexpected error: ${error.message}`);
    process.exitCode = 1;
});
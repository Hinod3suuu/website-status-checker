# Website Status Checker

A lightweight Node.js-based website monitoring utility designed to check HTTP and HTTPS endpoint availability, classify HTTP response codes, and measure response times. The application supports concurrent website checking, URL validation, request timeouts, connection error handling, and structured JSON report generation.

This project demonstrates fundamental networking and JavaScript programming concepts, including HTTP communication, asynchronous execution, Promise-based concurrency, performance measurement, and command-line application development.

## Features

- HTTP and HTTPS website availability checking
- Concurrent monitoring of multiple websites
- HTTP response status classification
- High-resolution response time measurement
- Five-second request deadline
- URL parsing and validation
- Detection of DNS resolution and connection failures
- Identification of HTTP redirects
- Command-line argument processing
- Optional JSON report generation
- Timestamped website status reporting
- Error handling for unreachable endpoints
- Support for Windows, Linux, and macOS
- No external dependencies required

## Tech Stack

- JavaScript
- Node.js
- HTTP / HTTPS
- Promises
- Async / Await
- Performance API
- File System API
- JSON
- Command-Line Interface
- Git & GitHub

## Project Structure

```text
website-status-checker/
├── .gitignore
├── LICENSE
├── README.md
├── index.js
└── package.json
```

Generated website reports, including `results.json`, are intentionally excluded from version control through `.gitignore`.

## Installation

Clone the repository:

```bash
git clone https://github.com/Hinodesuuu/website-status-checker.git
cd website-status-checker
```

Node.js is required to run the application.

No additional npm packages or external dependencies are required.

## Usage

Run the application with:

```bash
node index.js https://example.com
```

The application sends an HTTP or HTTPS request to the specified website and displays its current response status and latency.

### Multiple Website Checking

To check multiple websites simultaneously, provide multiple URLs as command-line arguments.

Example:

```bash
node index.js https://example.com https://github.com https://google.com
```

The application performs concurrent requests using JavaScript Promises.

Results are collected and displayed in the same order as the supplied URLs.

Concurrent execution can improve overall checking performance compared to sequential requests, particularly when individual websites experience network delays.

### HTTP Status Classification

The application categorizes HTTP response codes into predefined status classifications.

| HTTP Code | Classification | Description |
|-----------|----------------|-------------|
| 200–299 | HEALTHY | Successful HTTP response |
| 300–399 | REDIRECT | Resource redirects to another location |
| 400–499 | CLIENT ERROR | Client-side request error |
| 500–599 | SERVER ERROR | Server-side processing error |
| N/A | UNREACHABLE | DNS resolution or connection failure |
| N/A | TIMEOUT | Request exceeds the configured deadline |
| N/A | INVALID URL | Malformed or unsupported URL |

HTTP redirects are identified but are not automatically followed.

A website returning an HTTP error response is considered reachable, although the requested resource or service may not be functioning correctly.

### Request Timeout

The application enforces a five-second deadline for each website check.

Example:

```javascript
const TIMEOUT = 5000;
```

Each request is assigned an independent timer.

If the server does not provide an HTTP response within the configured deadline, the application reports the website as `TIMEOUT`.

The pending request is then terminated.

The timeout applies to receiving the initial HTTP response headers rather than downloading the complete webpage.

### Example Output

When multiple websites are checked, the application displays their HTTP classifications and response times.

Example:

```text
========================================
         WEBSITE STATUS CHECKER
========================================

Checking 3 website(s)...

----------------------------------------
Website:       https://example.com
Status:        HEALTHY
HTTP Code:     200
Response Time: 98 ms

----------------------------------------
Website:       https://github.com
Status:        HEALTHY
HTTP Code:     200
Response Time: 123 ms

----------------------------------------
Website:       https://google.com
Status:        REDIRECT
HTTP Code:     301
Response Time: 102 ms

========================================
Total Websites: 3
Checked At:     10/10/2026, 11:57:10 PM
========================================
```

Response times and HTTP status codes may vary depending on network conditions and server behavior.

## JSON Report Generation

Website checking results can be exported to a JSON file using the `--json` argument.

Example:

```bash
node index.js https://example.com https://github.com --json
```

After completing the checks, the application generates a structured JSON report named `results.json`.

Example:

```json
{
    "checkedAt": "2026-10-10T16:58:52.471Z",
    "totalWebsites": 2,
    "timeoutMs": 5000,
    "results": [
        {
            "website": "https://example.com",
            "status": "HEALTHY",
            "httpCode": 200,
            "responseTime": "98 ms",
            "error": null
        },
        {
            "website": "https://httpbin.org/status/404",
            "status": "CLIENT ERROR",
            "httpCode": 404,
            "responseTime": "1332 ms",
            "error": null
        }
    ]
}
```

The example demonstrates the report structure. Actual results depend on the URLs supplied and their responses.

The report contains:

- Timestamp of the completed website checks
- Total number of websites checked
- Configured request timeout
- Website URLs
- HTTP status classifications
- HTTP response codes
- Response times
- Connection error information when applicable

The timestamp is generated automatically in UTC using ISO 8601 formatting.

JSON reports can be used for local documentation, website diagnostics, and integration with other monitoring utilities.

Reports are generated only when the `--json` argument is provided.

Existing `results.json` files are overwritten when a new report is exported.

## Website Checking Process

When a website check is initiated, the application:

1. Parses the supplied command-line arguments.
2. Determines whether JSON exporting is enabled.
3. Validates the supplied website URLs.
4. Selects the appropriate HTTP or HTTPS client.
5. Initiates concurrent network requests using JavaScript Promises.
6. Starts an independent five-second deadline for each request.
7. Measures the elapsed time until HTTP response headers arrive.
8. Retrieves and classifies the HTTP response codes.
9. Detects DNS failures, connection errors, and request timeouts.
10. Collects the results in their original input order.
11. Displays the website statuses and response times in the terminal.
12. Exports the results to JSON when requested.

This provides a practical demonstration of asynchronous HTTP communication, concurrent network operations, and structured diagnostic reporting.

## Response Time Measurement

The application uses Node.js's Performance API to measure elapsed request time.

Example:

```javascript
const startTime = performance.now();
```

The elapsed time is calculated when an HTTP response is received or when a request fails.

Response times are reported in milliseconds.

The measurement represents the time required to receive the initial HTTP response headers.

It does not measure the complete download time of webpage content.

Network latency, DNS resolution, TLS negotiation, and server processing time can influence the reported results.

## Error Handling

The application includes error handling for common network and input failures.

Examples include:

- Invalid website URLs
- Unsupported URL protocols
- DNS resolution failures
- Refused network connections
- Unexpected connection termination
- Requests exceeding the configured deadline

When a website cannot be reached, the application reports the failure without terminating the remaining website checks.

Each website check returns a structured result containing its status, response time, and available error information.

## Security

The application is designed for educational purposes, website diagnostics, and authorized HTTP/HTTPS endpoint checking.

Website requests are performed using Node.js's built-in HTTP and HTTPS modules.

The application does not attempt authentication, exploit vulnerabilities, bypass access controls, or perform intrusive security testing.

Generated JSON reports are excluded from version control through `.gitignore` to prevent local diagnostic results from being unintentionally published.

Only check websites and endpoints you are authorized to access, and avoid sending excessive requests to third-party services.

## Limitations

- Only HTTP and HTTPS URLs are supported.
- Redirects are classified but are not automatically followed.
- The request deadline is fixed at five seconds.
- Custom timeout arguments are not currently supported.
- Response times measure the time until HTTP response headers arrive.
- Complete webpage content is not downloaded or analyzed.
- HTTP response classification does not guarantee full application functionality.
- Website availability is evaluated only when a check is executed.
- Continuous background monitoring is not implemented.
- Automatic retries are not currently supported.
- JSON reports are generated only when explicitly requested.
- Existing JSON reports are overwritten during subsequent exports.
- Performance depends on network conditions and remote server responsiveness.

## Future Improvements

Potential extensions include configurable request timeouts, automatic redirect following, retry logic, custom HTTP headers, and support for additional command-line options.

Further improvements could include continuous website monitoring, response-time history, uptime statistics, CSV report generation, and persistent diagnostic logs.

Additional enhancements may include automated testing, configurable concurrency limits, performance benchmarking, and integration with notification services.

## Author

**Hinod3suuu**

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
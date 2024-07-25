from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
import time
import threading

def run_test():
    # Set up Chrome options for headless mode (optional)
    options = Options()
    # options.add_argument("--headless")  # Run in headless mode
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    # Initialize the WebDriver
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(10)  # Implicit wait for 10 seconds

    # Navigate to the login page
    driver.get("http://care4link.com")  # Change to your actual URL

    # Find and interact with the login form elements
    email_input = driver.find_element(By.NAME, 'email')
    password_input = driver.find_element(By.NAME, 'password')
    sign_in_button = driver.find_element(By.TAG_NAME, 'button')

    # Fill in the form
    email_input.send_keys("venki@life9sys.com")
    password_input.send_keys("Venki@123")  # Use a valid test account
    sign_in_button.click()

    # Add some wait time to observe the results
    time.sleep(5)  # Wait for 5 seconds to observe the behavior

    # Check if login was successful
    try:
        assert "dashboard" in driver.current_url  # Replace with actual dashboard URL or check
        print("Login successful")
    except AssertionError:
        print("Login failed")

    # Close the browser
    driver.quit()

if __name__ == "__main__":
    threads = []
    for i in range(10):  # Number of concurrent users
        t = threading.Thread(target=run_test)
        threads.append(t)
        t.start()

    for t in threads:
        t.join()  # Wait for all threads to complete

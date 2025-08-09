from playwright.sync_api import sync_playwright
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:5175/")

    # Wait for the login button to be visible
    page.wait_for_selector('button:has-text("Sign in with Google")')

    # Use an absolute path for the screenshot
    screenshot_path = os.path.abspath("jules-scratch/verification/login_page.png")
    page.screenshot(path=screenshot_path)

    browser.close()

with sync_playwright() as playwright:
    run(playwright)

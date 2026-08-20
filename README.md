# UTAR Gaming E-Sports Club

Static HTML, CSS, JavaScript, and image assets for the UTAR Gaming E-Sports Club website.

## GitHub Pages

1. Create a GitHub repository and upload the contents of this folder to the repository root.
2. Push the files to either the `main` or `master` branch. The included `.github/workflows/deploy-pages.yml` supports both branch names.
3. Open **Settings > Pages** and set **Build and deployment** to **GitHub Actions**.
4. Open the **Actions** tab and wait for **Deploy static site to GitHub Pages** to complete.
5. Open the generated Pages URL from the workflow summary.

If you prefer branch deployment instead, choose **Deploy from a branch** and select the repository's active branch with the `/ (root)` folder. Do not use both deployment methods at the same time.

The site is client-side only. The events page may call its public time API when available and already includes a browser-time fallback if that request fails.

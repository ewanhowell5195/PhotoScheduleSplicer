# PhotoSplicer
Take photos on a schedule and splice them together

---
This program takes photos on a set schedule, then stitches them all together to create a single image that shows the transition over the schedule's duration.

Example:

![](https://petapixel.com/assets/uploads/2012/10/sunsetsigle.jpg)
## Requirements
- FFmpeg
- An iPhone / iPad
  - Running iOS 14 (Other versions may work)
  - Jailbroken
  - OpenSSH Tweak
  - Activator Tweak
  - Connected on the same WiFi network as the computer running the script

## Usage
1. Clone the repo and install the modules.
2. Setup the iPhone in position and open the camera app. Make sure auto-lock is set to never.
3. Configure the `settings.json` file.
```js
{
  "ip": "192.168.0.232", // The local IP address of the iPhone.
  "password": "alpine", // The root user password for the iPhone.
  "photos": 24, // The number of photos to slice together.
  "cron": "0 * * * *" // Schedule for how often a photo should be taken.
}
```
4. Run the script.
5. Wait.

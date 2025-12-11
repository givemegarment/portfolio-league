# Sound Effects

Add the following MP3 files to enable sound effects in Portfolio League:

## Required Files

- `submit.mp3` - Played when portfolio is successfully submitted
- `win.mp3` - Played for winning/top rank achievements  
- `levelUp.mp3` - Played when unlocking achievements
- `notification.mp3` - Played for new notifications
- `click.mp3` - Played on button clicks (optional, subtle)
- `error.mp3` - Played on errors

## Recommendations

- Keep files short (under 1 second for UI sounds)
- Use MP3 format for browser compatibility
- Keep file sizes small (under 50KB each)
- Consider using royalty-free sound effects from:
  - https://freesound.org
  - https://mixkit.co/free-sound-effects/
  - https://www.zapsplat.com

## Fallback

If sound files are missing, the app will silently continue without audio feedback.
The `sounds.ts` library also includes Web Audio API-based beeps as a fallback option.




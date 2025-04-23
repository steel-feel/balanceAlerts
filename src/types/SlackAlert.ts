export class SlackAlert {
    private slackUrl: string 

    constructor(_slackUrl: string) {
        this.slackUrl = _slackUrl
    }


async sendAlert(content: string) {
    await fetch(this.slackUrl, {
        body: JSON.stringify({
            "icon_emoji": ":fuelpump:",
            "username": "Low Balance Bot",
            "text": content
        }),
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        }
    }).catch(err => console.error(err))
}

}
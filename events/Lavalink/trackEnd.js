module.exports = async (client, player, track, playload) => {
    player.set("autoplay", false);
    
    try {
        var res = await player.search(
            `https://www.youtube.com/watch?v=${player.queue.current.identifier}&list=RD${player.queue.current.identifier}`,
            player.get("requester")
        );

        // Check if tracks exist and the index is valid
        if (res.tracks && res.tracks.length > 2) {
            await player.queue.add(res.tracks[2]);
        } else {
            console.log("Not enough tracks in search results to add track #2");
        }
    } catch (error) {
        console.error("Error in trackEnd event:", error);
    }
}
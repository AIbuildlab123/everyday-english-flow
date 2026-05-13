export type IdiomBankEntry = {
  phrase: string;
  definition: string;
  example_sentence: string;
};

/** Pipe-separated rows: phrase|definition|example (no external AI — static bank). */
const TSV = `
A dime a dozen|Very common or easy to find|Those souvenir mugs are a dime a dozen downtown.
A piece of cake|Very easy|Fixing that typo was a piece of cake.
Beat around the bush|Avoid the main topic|Stop beating around the bush and tell me what happened.
Break the ice|Reduce awkwardness at the start|He told a joke to break the ice before the meeting.
Call it a day|Stop working for the rest of the day|We finished the draft—let’s call it a day.
Cut corners|Do something the cheapest or fastest way, often sacrificing quality|If you cut corners on testing, bugs will show up later.
Get the ball rolling|Start an activity|I’ll share the agenda to get the ball rolling.
Hit the nail on the head|Describe something exactly right|You hit the nail on the head about why we’re behind schedule.
In hot water|In trouble|He’s in hot water after missing the client deadline.
It takes two to tango|Both sides share responsibility|It takes two to tango, so let’s fix the process together.
Jump on the bandwagon|Join something popular because others did|Everyone jumped on the bandwagon after the product went viral.
Keep your chin up|Stay optimistic|Keep your chin up—you’ll get another interview soon.
Let the cat out of the bag|Reveal a secret accidentally|She let the cat out of the bag about the surprise party.
Miss the boat|Miss an opportunity|If we wait too long, we’ll miss the boat on early pricing.
On the same page|Agree or understand the same plan|Let’s align so we’re on the same page before the demo.
Out of the blue|Unexpectedly|He called me out of the blue after years of silence.
Pull someone’s leg|Tease or joke with someone|Are you pulling my leg, or did that really happen?
Ring a bell|Sound familiar|That name rings a bell from college.
Spill the beans|Reveal secret information|Come on, spill the beans—what did they offer you?
Under the weather|Feeling slightly ill|I’m a bit under the weather, so I’ll keep my camera off.
Wrap your head around|Understand something complex|It took me a minute to wrap my head around the new policy.
Your guess is as good as mine|I don’t know either|Your guess is as good as mine when the bus will arrive.
Bite off more than you can chew|Take on more than you can handle|Don’t bite off more than you can chew with three deadlines in one day.
Costs an arm and a leg|Very expensive|Rent downtown costs an arm and a leg.
Cry over spilled milk|Complain about something that can’t be fixed|No use crying over spilled milk—we should pivot now.
Every cloud has a silver lining|Something good comes from a bad situation|Losing that client had a silver lining: we simplified our roadmap.
Give the benefit of the doubt|Assume someone is innocent or honest|I’ll give him the benefit of the doubt until we see the logs.
Go the extra mile|Do more than required|She went the extra mile to help the new hire onboard.
Hit the books|Study hard|I need to hit the books before the exam tomorrow.
In a nutshell|In a few words|In a nutshell, we need more time and more budget.
It’s not rocket science|Not very complicated|It’s not rocket science—just follow the checklist.
Keep an eye on|Watch carefully|Please keep an eye on the deployment dashboard tonight.
Let sleeping dogs lie|Avoid restarting an old conflict|Let sleeping dogs lie—don’t bring up last year’s argument.
Make ends meet|Earn enough to cover basic expenses|Freelancing helps her make ends meet between contracts.
No pain, no gain|Progress requires effort|Training is tough, but no pain, no gain.
On cloud nine|Extremely happy|She was on cloud nine after getting the offer.
Play it by ear|Decide as you go|We don’t have a strict plan—we’ll play it by ear.
Pull yourself together|Calm down and regain composure|Take a breath and pull yourself together before the interview.
Read between the lines|Infer unstated meaning|If you read between the lines, the email is actually a warning.
Run out of steam|Lose energy or motivation|We ran out of steam after the third hour of brainstorming.
See eye to eye|Agree|We don’t see eye to eye on the timeline, but we agree on the goal.
Speak of the devil|Someone appears right when they were mentioned|Speak of the devil—we were just talking about you!
Take it with a grain of salt|Don’t believe something completely|Take rumors with a grain of salt until you verify them.
The ball is in your court|It’s your decision or move next|The ball is in your court—tell us if you accept the offer.
Through thick and thin|In good times and bad|They stayed friends through thick and thin.
Time flies|Time passes quickly|Time flies when you’re deep in a good project.
Under the table|Secretly and often illegally|They paid him under the table for side gigs.
Up in the air|Uncertain|Travel plans are still up in the air because of the storm.
When pigs fly|Never|He’ll apologize when pigs fly.
Wild goose chase|A hopeless search|Fixing that bug became a wild goose chase through legacy code.
You can say that again|Strong agreement|“This coffee is strong.” “You can say that again.”
A blessing in disguise|Something bad that turns out good|Missing the flight was a blessing in disguise—we avoided the storm.
Actions speak louder than words|What you do matters more than what you say|Actions speak louder than words, so ship the fix first.
Add fuel to the fire|Make a bad situation worse|Don’t add fuel to the fire with sarcastic comments in the thread.
At the drop of a hat|Immediately|She’d help you at the drop of a hat.
Back to the drawing board|Start over because the plan failed|The prototype failed—back to the drawing board.
Better late than never|Doing something late is better than not doing it|Better late than never—thanks for sending the notes.
Burn the midnight oil|Work late into the night|We burned the midnight oil to finish the release notes.
Cross your fingers|Hope for good luck|Cross your fingers—the demo depends on the Wi‑Fi.
Don’t count your chickens before they hatch|Don’t assume success too early|Don’t count your chickens before the contract is signed.
Elephant in the room|An obvious problem people avoid mentioning|Let’s address the elephant in the room: we’re over budget.
Feeling blue|Feeling sad|She’s feeling blue after moving away from friends.
Get cold feet|Become nervous and hesitant|He got cold feet right before signing the lease.
Give someone the cold shoulder|Ignore someone on purpose|After the argument, she gave him the cold shoulder.
Go down in flames|Fail spectacularly|The pitch went down in flames when the demo crashed.
Hit the sack|Go to bed|I’m exhausted—I’m going to hit the sack.
In the nick of time|Just before it’s too late|We arrived in the nick of time for boarding.
It’s a blessing|Something good you’re thankful for|Having remote work is a blessing for my schedule.
Jump the gun|Start too early|Don’t jump the gun—wait for legal approval.
Keep your fingers crossed|Hope for success|I’m keeping my fingers crossed for the interview tomorrow.
Leave no stone unturned|Search everywhere / try everything|We left no stone unturned looking for the root cause.
Make a long story short|Summarize quickly|Long story short, we shipped on Tuesday.
Not my cup of tea|Not something you enjoy|Horror movies aren’t my cup of tea.
Off the hook|Free from blame or obligation|You’re off the hook—I’ll take the late shift.
Once in a blue moon|Very rarely|We only see snow here once in a blue moon.
Piece of the pie|A share of something|Everyone wants a piece of the pie from the bonus pool.
Put all your eggs in one basket|Risk everything on one plan|Don’t put all your eggs in one basket with a single vendor.
Rain on someone’s parade|Spoil someone’s enjoyment|I hate to rain on your parade, but that date isn’t available.
Sit on the fence|Avoid choosing a side|Stop sitting on the fence and pick a vendor.
Steal someone’s thunder|Take attention away from someone|He stole her thunder by announcing her idea first.
Take a rain check|Politely postpone an invitation|Can I take a rain check on dinner tonight?
The best of both worlds|Benefits from two different situations|Remote work can be the best of both worlds for focus and collaboration.
The last straw|Final problem that causes a reaction|Missing the deadline was the last straw for the client.
Think outside the box|Think creatively|We need to think outside the box for user onboarding.
Throw in the towel|Give up|After three revisions, he threw in the towel on the design debate.
Turn a blind eye|Pretend not to notice wrongdoing|We can’t turn a blind eye to security warnings.
Twist someone’s arm|Persuade someone|She twisted my arm until I agreed to host the meetup.
Under the gun|Under strong pressure|We’re under the gun to finish before the audit.
Up to speed|Fully informed|Let me get you up to speed on the incident timeline.
Win-win|Good for both sides|A shorter contract can be win-win for both teams.
Your mileage may vary|Results may differ for others|This setup works for us—your mileage may vary.
A storm in a teacup|A small problem treated as a big one|It was a storm in a teacup—just a misconfigured flag.
Back on track|Returning to good progress|After the outage, we’re back on track with releases.
Ballpark figure|Rough estimate|Can you give me a ballpark figure for the migration cost?
Barking up the wrong tree|Accusing the wrong person or pursuing the wrong idea|If you blame caching, you might be barking up the wrong tree.
Beating a dead horse|Continuing an argument that is settled|We’re beating a dead horse—let’s move to action items.
Behind the scenes|Not visible publicly|Behind the scenes, the team fixed the issue in minutes.
Big fish in a small pond|Important only in a limited area|He was a big fish in a small pond at that startup.
Break a leg|Good luck (often in performing arts)|Break a leg at your presentation today!
Burn bridges|Destroy relationships so you can’t return|Don’t burn bridges when you resign—networks are small.
By the book|Following rules strictly|Finance wants everything done by the book.
Close but no cigar|Almost successful, but not quite|Close but no cigar—we missed SLA by two minutes.
Cut to the chase|Get to the important part|Let’s cut to the chase—what’s the decision?
Down to earth|Practical and humble|She’s successful but still down to earth with interns.
Draw a blank|Forget suddenly|I drew a blank when they asked for the metric name.
Drop the ball|Make a mistake by neglecting responsibility|We dropped the ball on communicating the outage.
Fair and square|Honestly and according to rules|He won fair and square in the hackathon judging.
Get a kick out of|Enjoy greatly|I get a kick out of watching beginners nail their first lesson.
Get off on the wrong foot|Start a relationship badly|We got off on the wrong foot, but later we became friends.
Give it a shot|Try something|Give it a shot—you might like pair programming.
Go bananas|Become very excited or angry|The crowd went bananas when the band started.
Hang in there|Persevere|Hang in there—the sprint ends tomorrow.
Have a blast|Have a great time|We had a blast at the team offsite.
Hit the ground running|Start quickly and effectively|She hit the ground running on day one.
In the loop|Informed|Please keep me in the loop about pricing changes.
It’s a long shot|Unlikely to succeed|Getting that venue is a long shot, but worth asking.
Jump through hoops|Do many difficult steps to achieve something|Applicants had to jump through hoops to get approved.
Keep a straight face|Avoid laughing|I couldn’t keep a straight face during the improv exercise.
Know the ropes|Understand how something works|After a week, he knows the ropes of the build pipeline.
Let someone off the hook|Release someone from blame or obligation|I’ll let you off the hook—just send the recap by EOD.
Make waves|Cause controversy|He likes to make waves in meetings, but sometimes it helps.
No-brainer|Very easy decision|Switching to HTTPS is a no-brainer for security.
Off the top of my head|Without careful thought|Off the top of my head, latency doubled after the deploy.
On the ball|Alert and competent|Our new PM is really on the ball with follow-ups.
Once bitten, twice shy|Cautious after a bad experience|I’m once bitten, twice shy about promising exact ship dates.
Pass with flying colors|Succeed easily|She passed the certification with flying colors.
Put the cart before the horse|Do things in the wrong order|Buying ads before product-market fit is putting the cart before the horse.
Quick on the draw|Fast to react|Support was quick on the draw during the incident.
Rule of thumb|Practical guideline|As a rule of thumb, keep PRs under 400 lines when possible.
Save for a rainy day|Save money for future problems|We should save for a rainy day before expanding perks.
Shoot from the hip|Speak bluntly without much preparation|He tends to shoot from the hip in leadership meetings.
Sit tight|Wait patiently|Sit tight—we’re rolling back the change now.
Smell a rat|Suspect something is wrong|I smell a rat in these unusually low estimates.
Speak volumes|Reveal a lot indirectly|Her tone spoke volumes about how frustrated she was.
Start from scratch|Begin again from nothing|We had to start from scratch after losing the prototype data.
Take five|Take a short break|Let’s take five and revisit with fresh eyes.
Take it easy|Relax|Take it easy this weekend—you’ve earned it.
The icing on the cake|Something extra good added to something already good|Free lunch was the icing on the cake after the launch.
Throw someone under the bus|Blame someone unfairly to protect yourself|Don’t throw your teammate under the bus in the postmortem.
Tie the knot|Get married|They tied the knot in a small ceremony last spring.
Up for grabs|Available for anyone to take|Those tickets are up for grabs if you want them.
Water under the bridge|Past problems that no longer matter|That argument is water under the bridge now.
Wear many hats|Have many responsibilities|At a startup, you wear many hats—sales, support, and ops.
When it rains, it pours|Many bad things happen at once|When it rains, it pours: the build broke and the vendor went offline.
You’re pulling my leg|You must be joking|You got promoted twice in one month—you’re pulling my leg!
Zero in on|Focus closely on|Let’s zero in on the top three customer complaints.
`.trim();

function parseTsv(tsv: string): IdiomBankEntry[] {
  const rows: IdiomBankEntry[] = [];
  for (const line of tsv.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split("|");
    if (parts.length < 3) continue;
    const [phrase, definition, example_sentence] = parts.map((p) => p.trim());
    if (!phrase || !definition || !example_sentence) continue;
    rows.push({ phrase, definition, example_sentence });
  }
  return rows;
}

export const IDIOM_BANK: IdiomBankEntry[] = parseTsv(TSV);

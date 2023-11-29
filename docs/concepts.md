Tally organizes crossword times into `tournaments`. Think of a tournament as a
static set of people who compete on the mini crossword semi-regularly. Tally
allows participants to submit a score (completion time) daily, and using that
information will collate some fun stats about the participants individually as
well as compared to everyone in the tournament.

### Tournaments

Tournaments have a `name`. They also have a list of `contestant`s. Tournament
statistics are publicly accessible, but contestants need a secret passcode to
be able to register new scores.

### Contestants

Contestants have a `name` and a passcode they use to authenticate with Tally.
They can optionally set an email address that can be used to reset their
passcode if they ever lose it. Contestants are associated with a list of scores.

### Scores

Scores have an associated `contestantID`. They have a `date` representing the
date of the associated crossword puzzle. They have a `score` which is the
completion time in seconds. Contestants can only submit one score per date.

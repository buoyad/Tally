import { redirect } from "next/navigation";
import { getLoggedInUser } from "../lib/hooks";
import { Box, Heading } from "../ui/components";
import Form from './form'

export default async function Page() {
    const session = await getLoggedInUser()
    if (!session.userInfo) {
        redirect('/login?error=Score')
    }

    return <main>
        <Box>
            <Heading>Register score</Heading>
            <Form userInfo={session.userInfo} />
        </Box>
    </main>
}
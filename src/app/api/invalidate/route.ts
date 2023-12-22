import log from "@/app/lib/log"
import { revalidatePath } from "next/cache"

export const dynamic = 'force-dynamic'

const invalidateCache = (req: Request, res: Response) => {
    log.info('/api/invalidate: received request to invalidate cache')
    revalidatePath('/', 'layout')
    return new Response('caches invalidated')
}

export { invalidateCache as GET }
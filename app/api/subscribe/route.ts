import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ message: 'Invalid email' }, { status: 400 });
        }

        const res = await fetch('https://api.beehiiv.com/v2/subscribers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.BEEHIIV_API_KEY}`,
            },
            body: JSON.stringify({
                email,
                publication_id: process.env.BEEHIIV_PUBLICATION_ID,
            }),
        });

        const text = await res.text();
        let data: any = {};

        try {
            data = JSON.parse(text);
        } catch (err) {
            // response wasn't JSON — that's okay
        }

        if (!res.ok) {
            console.error('Beehiiv API error:', data || text);
            return NextResponse.json({ message: data?.message || 'Subscription failed' }, { status: res.status });
        }


        return NextResponse.json({ message: 'Successfully subscribed!' }, { status: 200 });

    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

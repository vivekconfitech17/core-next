import { NextResponse } from 'next/server'
import { auth } from '../../../../libs/auth'

export async function GET(req: Request) {
  try {
    const session: any = await auth()

    if (!session?.accessToken) {
      return NextResponse.json({ message: 'User is already logged out' }, { status: 200 })
    }

    // let r = await signOut()
    // // 🔹 Keycloak Logout URLNEXTAUTH_URL
    const keycloakLogoutUrl = `${process.env.AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/logout?id_token_hint=${session.idToken}&redirect_uri=${encodeURIComponent(process.env.NEXTAUTH_URL as string)}/api/auth/afterlogout`

    // console.log('🔹 Logging out user from Keycloak:', keycloakLogoutUrl)
    //  console.log('response: ', r)
    // // 🔹 Clear NextAuth Session
    const response = NextResponse.redirect(keycloakLogoutUrl)

    // response.headers.append('Set-Cookie', 'next-auth.session-token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0')
    // response.headers.append(
    //   'Set-Cookie',
    //   '__Secure-next-auth.session-token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
    // )
    // response.headers.append(
    //   'Set-Cookie',
    //   '__Host-next-auth.session-token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
    // )

    return response
  } catch (error) {
    console.error('❌ Server-side logout error:', error)

    return NextResponse.json({ error: 'Failed to log out user' }, { status: 500 })
  }
}

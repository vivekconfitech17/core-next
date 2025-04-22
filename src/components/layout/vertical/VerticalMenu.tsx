// Next Imports

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, SubMenu, MenuItem } from '@menu/vertical-menu'

// import { GenerateVerticalMenu } from '@components/GenerateMenu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

// Menu Data Imports
// import menuData from '@/data/navigation/verticalMenuData'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {

  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()


  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions


  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
          className: 'bs-full overflow-y-auto overflow-x-hidden',
          onScroll: container => scrollMenu(container, false)
        }
        : {
          className: 'bs-full overflow-y-auto overflow-x-hidden',
          options: { wheelPropagation: false, suppressScrollX: true },
          onScrollY: container => scrollMenu(container, true)
        })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 17 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {/* <SubMenu
          label='dashboards'
          icon={<i className='ri-home-smile-line' />}
          suffix={<Chip label='5' size='small' color='error' />}
        >

          <MenuItem href='/dashboards/analytics'>analytics</MenuItem>
          <MenuItem href='/dashboards/ecommerce'>eCommerce</MenuItem>
          <MenuItem href='/dashboards/academy'>academy</MenuItem>
          <MenuItem href='/dashboards/logistics'>logistics</MenuItem>
        </SubMenu> */}

        <MenuItem href='/dashboards'
          icon={<i className='ri-home-smile-line' />}>Dashboards</MenuItem>
        <SubMenu label='Master' icon={<i className='ri-database-2-line' />}>
          <MenuItem href='/masters/provider-config'>
            Provider Config
          </MenuItem>
          <SubMenu label='Insurance Config' icon={<i className='ri-file-list-3-line' />}>
            <MenuItem href='/masters/insurance-config/basic-details'>
              Basic Details
            </MenuItem>
            <MenuItem href='/masters/insurance-config/call-management'>
              Call Management
            </MenuItem>
            <MenuItem href='/masters/insurance-config/benefit-config'>
              Benefit Config
            </MenuItem>
            <MenuItem href='/masters/insurance-config/address-config'>
              Address Config
            </MenuItem>
          </SubMenu>
          <MenuItem href='/masters/fund-config'>
            Fund Config
          </MenuItem>
          <MenuItem href='/masters/commissionrole-config'>
            CommissionRole Config
          </MenuItem>
          <MenuItem href='/masters/service-grouping'>
            Service Groups
          </MenuItem>
          <MenuItem href='/underwriting/guidelines'>
            Underwriting Guidelines
          </MenuItem>
          <MenuItem href='/questionnaire'>
            Underwriting Questionnaire
          </MenuItem>
          <MenuItem href='/taxes'>
            Tax
          </MenuItem>
          <MenuItem href='/bank-management/banks'>
            Banks
          </MenuItem>
          <MenuItem href='/bank-management/cards'>
            Cards
          </MenuItem>
        </SubMenu>
        {/* <MenuSection label='sges'> */}
        <SubMenu label='Product Factory' icon={<i className='ri-settings-3-line' />}>
          <MenuItem href='/masters/parameters'>
            Rule Parameterization
          </MenuItem>
          <MenuItem href='/masters/benefit-hierarchy'>
            Benefit Hierchy
          </MenuItem>
          <MenuItem href='/products'>
            Product Configurator
          </MenuItem>
          <MenuItem href='/premium'>
            Premium Management
          </MenuItem>
        </SubMenu>
        <SubMenu label='SFA' icon={<i className='ri-user-follow-line' />}>
          <MenuItem href='/agents/management'>
            Agent Management
          </MenuItem>
          <MenuItem href='/agents/lead'>
            Lead Management
          </MenuItem>
          <MenuItem href='/agents/target'>
            Target Management
          </MenuItem>
          <MenuItem href='/client/prospects'>
            Prospect Management
          </MenuItem>
          <MenuItem href='/plans'>
            Plan
          </MenuItem>
          <MenuItem href='/quotations'>
            Quotation Management
          </MenuItem>
          <MenuItem href='/client/clients'>
            Client Management
          </MenuItem>
          <MenuItem href='/invoices'>
            Invoice Management
          </MenuItem>
        </SubMenu>
        <SubMenu label='Finance' icon={<i className='ri-bank-line' />}>
          <MenuItem href='/receipts'>
            Receipt Management
          </MenuItem>
        </SubMenu>
        <SubMenu label='Policy' icon={<i className='ri-file-text-line' />}>
          <MenuItem href='/policies'>
            Policies
          </MenuItem>
          <MenuItem href='/member-upload/member'>
            Member
          </MenuItem>
          <MenuItem href='/member-balance'>
            Member Balance
          </MenuItem>
          <MenuItem href='/member-enquiry'>
            Member Enquiry
          </MenuItem>
          <MenuItem href='/renewals/pending'>
            Renewal Pending
          </MenuItem>
          <MenuItem href='/renewals/config'>
            Renewal Config
          </MenuItem>
          <MenuItem href='/endorsements'>
            Endorsements
          </MenuItem>
        </SubMenu>
        <SubMenu label='Provider' icon={<i className='ri-links-line' />}>
          <MenuItem href='/provider'>
            Provider
          </MenuItem>
          <MenuItem href='/provider/negotiation'>
            Negotiation
          </MenuItem>
          <MenuItem href='/provider/visit-fee'>
            Visit Fee
          </MenuItem>
        </SubMenu>
        <SubMenu label='Fund' icon={<i className='ri-money-dollar-box-fill' />}>
          <MenuItem href='/funds/statement'>
            Fund Statement
          </MenuItem>
          <MenuItem href='/funds/config'>
            Fund Config
          </MenuItem>
          <MenuItem href='/fees'>
            Fees Config
          </MenuItem>
        </SubMenu>
        <SubMenu label='HR Management' icon={<i className='ri-file-list-3-line' />}>
          <MenuItem href='/hr/agent-hierarchy'>
            Agent Hierarchy
          </MenuItem>
          <MenuItem href='/hr/employee-hierarchy'>
            Employee Hierarchy
          </MenuItem>
          <MenuItem href='/branch'>
            Branch
          </MenuItem>
        </SubMenu>
        <SubMenu label='User Management' icon={<i className='ri-shield-user-line' />}>
          <MenuItem href='/user-management/access-rights'>
            Access Rights
          </MenuItem>
          <MenuItem href='/user-management/users'>
            Users
          </MenuItem>
        </SubMenu>
        <SubMenu label='Claims Management' icon={<i className='ri-file-paper-line' />}>
          <MenuItem href='/claims'>
            Claim Dashboard
          </MenuItem>
          <MenuItem href='/claims/claims-preauth'>
            Pre-Auth
          </MenuItem>
          <MenuItem href='/claims/case-management'>
            Case Management
          </MenuItem>
          <MenuItem href='/claims/claims-intimation'>
            Claims Intimation
          </MenuItem>
          <MenuItem href='/claims/claims'>
            Claims
          </MenuItem>
          <MenuItem href='/claims/credit'>
            Credit Claims
          </MenuItem>
          <MenuItem href='/claims/claims-reimbursement'>
            Reimbursement Claim
          </MenuItem>
          <MenuItem href='/claims/claims-to-be-processed'>
            Claims To Be Processed
          </MenuItem>
          <MenuItem href='/claims/claims-audit'>
            Claims Audit
          </MenuItem>
          <MenuItem href='/claims/ready-for-payment'>
            Ready for Payment
          </MenuItem>
          <MenuItem href='/claims/rejected-claims'>
            Exgratia Claims
          </MenuItem>
          <MenuItem href='/claims/claims-reimbursement'>
            Indiminity Claims
          </MenuItem>
          <MenuItem href='/claims/letter'>
            Letter
          </MenuItem>

        </SubMenu>
        <MenuItem href='/sla/configuration' icon={<i className='ri-slideshow-line' />}>
          Sla Configuration
        </MenuItem>
        <MenuItem href='/reports' icon={<i className='ri-file-list-line' />}>
          Reports
        </MenuItem>
        {/* <SubMenu label='Reports' icon={<i className='ri-file-list-line' />}>
          <MenuItem href='/report/underwritings'>
            Underwritings Reports
          </MenuItem>
          <MenuItem href='/report/claims'>
            Claim Reports
          </MenuItem>
        </SubMenu> */}

        {/* </MenuSection> */}
        {/*
        <MenuSection label='appsPages'>
          <SubMenu label='eCommerce' icon={<i className='ri-shopping-bag-3-line' />}>
            <MenuItem href='/apps/ecommerce/dashboard'>dashboard</MenuItem>
            <SubMenu label='products'>
              <MenuItem href='/apps/ecommerce/products/list'>list</MenuItem>
              <MenuItem href='/apps/ecommerce/products/add'>add</MenuItem>
              <MenuItem href='/apps/ecommerce/products/category'>
                category
              </MenuItem>
            </SubMenu>
            <SubMenu label='orders'>
              <MenuItem href='/apps/ecommerce/orders/list'>list</MenuItem>
              <MenuItem
                href='/apps/ecommerce/orders/details/5434'
                exactMatch={false}
                activeUrl='/apps/ecommerce/orders/details'
              >
                details
              </MenuItem>
            </SubMenu>
            <SubMenu label='customers'>
              <MenuItem href='/apps/ecommerce/customers/list'>list</MenuItem>
              <MenuItem
                href='/apps/ecommerce/customers/details/879861'
                exactMatch={false}
                activeUrl='/apps/ecommerce/customers/details'
              >
                details
              </MenuItem>
            </SubMenu>
            <MenuItem href='/apps/ecommerce/manage-reviews'>
              manageReviews
            </MenuItem>
            <MenuItem href='/apps/ecommerce/referrals'>referrals</MenuItem>
            <MenuItem href='/apps/ecommerce/settings'>settings</MenuItem>
          </SubMenu>
          <SubMenu label='academy' icon={<i className='ri-graduation-cap-line' />}>
            <MenuItem href='/apps/academy/dashboard'>dashboard</MenuItem>
            <MenuItem href='/apps/academy/my-courses'>myCourses</MenuItem>
            <MenuItem href='/apps/academy/course-details'>
              courseDetails
            </MenuItem>
          </SubMenu>
          <SubMenu label='logistics' icon={<i className='ri-car-line' />}>
            <MenuItem href='/apps/logistics/dashboard'>dashboard</MenuItem>
            <MenuItem href='/apps/logistics/fleet'>fleet</MenuItem>
          </SubMenu>
          <MenuItem
            href='/apps/email'
            icon={<i className='ri-mail-open-line' />}
            exactMatch={false}
            activeUrl='/apps/email'
          >
            email
          </MenuItem>
          <MenuItem href='/apps/chat' icon={<i className='ri-wechat-line' />}>
            chat
          </MenuItem>
          <MenuItem href='/apps/calendar' icon={<i className='ri-calendar-line' />}>
            calendar
          </MenuItem>
          <MenuItem href='/apps/kanban' icon={<i className='ri-drag-drop-line' />}>
            kanban
          </MenuItem>
          <SubMenu label='invoice' icon={<i className='ri-bill-line' />}>
            <MenuItem href='/apps/invoice/list'>list</MenuItem>
            <MenuItem
              href='/apps/invoice/preview/4987'
              exactMatch={false}
              activeUrl='/apps/invoice/preview'
            >
              preview
            </MenuItem>
            <MenuItem href='/apps/invoice/edit/4987' exactMatch={false} activeUrl='/apps/invoice/edit'>
              edit
            </MenuItem>
            <MenuItem href='/apps/invoice/add'>add</MenuItem>
          </SubMenu>
          <SubMenu label='user' icon={<i className='ri-user-line' />}>
            <MenuItem href='/apps/user/list'>list</MenuItem>
            <MenuItem href='/apps/user/view'>view</MenuItem>
          </SubMenu>
          <SubMenu label='rolesPermissions' icon={<i className='ri-lock-2-line' />}>
            <MenuItem href='/apps/roles'>roles</MenuItem>
            <MenuItem href='/apps/permissions'>permissions</MenuItem>
          </SubMenu>
          <SubMenu label='pages' icon={<i className='ri-layout-left-line' />}>
            <MenuItem href='/pages/user-profile'>userProfile</MenuItem>
            <MenuItem href='/pages/account-settings'>accountSettings</MenuItem>
            <MenuItem href='/pages/faq'>faq</MenuItem>
            <MenuItem href='/pages/pricing'>pricing</MenuItem>
            <SubMenu label='miscellaneous'>
              <MenuItem href='/pages/misc/coming-soon' target='_blank'>
                comingSoon
              </MenuItem>
              <MenuItem href='/pages/misc/under-maintenance' target='_blank'>
                underMaintenance
              </MenuItem>
              <MenuItem href='/pages/misc/404-not-found' target='_blank'>
                pageNotFound404
              </MenuItem>
              <MenuItem href='/pages/misc/401-not-authorized' target='_blank'>
                notAuthorized401
              </MenuItem>
            </SubMenu>
          </SubMenu>
          <SubMenu label='authPages' icon={<i className='ri-shield-keyhole-line' />}>
            <SubMenu label='login'>
              <MenuItem href='/pages/auth/login-v1' target='_blank'>
                loginV1
              </MenuItem>
              <MenuItem href='/pages/auth/login-v2' target='_blank'>
                loginV2
              </MenuItem>
            </SubMenu>
            <SubMenu label='register'>
              <MenuItem href='/pages/auth/register-v1' target='_blank'>
                registerV1
              </MenuItem>
              <MenuItem href='/pages/auth/register-v2' target='_blank'>
                registerV2
              </MenuItem>
              <MenuItem href='/pages/auth/register-multi-steps' target='_blank'>
                registerMultiSteps
              </MenuItem>
            </SubMenu>
            <SubMenu label='verifyEmail'>
              <MenuItem href='/pages/auth/verify-email-v1' target='_blank'>
                verifyEmailV1
              </MenuItem>
              <MenuItem href='/pages/auth/verify-email-v2' target='_blank'>
                verifyEmailV2
              </MenuItem>
            </SubMenu>
            <SubMenu label='forgotPassword'>
              <MenuItem href='/pages/auth/forgot-password-v1' target='_blank'>
                forgotPasswordV1
              </MenuItem>
              <MenuItem href='/pages/auth/forgot-password-v2' target='_blank'>
                forgotPasswordV2
              </MenuItem>
            </SubMenu>
            <SubMenu label='resetPassword'>
              <MenuItem href='/pages/auth/reset-password-v1' target='_blank'>
                resetPasswordV1
              </MenuItem>
              <MenuItem href='/pages/auth/reset-password-v2' target='_blank'>
                resetPasswordV2
              </MenuItem>
            </SubMenu>
            <SubMenu label='twoSteps'>
              <MenuItem href='/pages/auth/two-steps-v1' target='_blank'>
                twoStepsV1
              </MenuItem>
              <MenuItem href='/pages/auth/two-steps-v2' target='_blank'>
                twoStepsV2
              </MenuItem>
            </SubMenu>
          </SubMenu>
          <SubMenu label='wizardExamples' icon={<i className='ri-git-commit-line' />}>
            <MenuItem href='/pages/wizard-examples/checkout'>checkout</MenuItem>
            <MenuItem href='/pages/wizard-examples/property-listing'>
              propertyListing
            </MenuItem>
            <MenuItem href='/pages/wizard-examples/create-deal'>
              createDeal
            </MenuItem>
          </SubMenu>
          <MenuItem href='/pages/dialog-examples' icon={<i className='ri-tv-2-line' />}>
            dialogExamples
          </MenuItem>
          <SubMenu label='widgetExamples' icon={<i className='ri-bar-chart-box-line' />}>
            <MenuItem href='/pages/widget-examples/basic'>basic</MenuItem>
            <MenuItem href='/pages/widget-examples/advanced'>advanced</MenuItem>
            <MenuItem href='/pages/widget-examples/statistics'>
              statistics
            </MenuItem>
            <MenuItem href='/pages/widget-examples/charts'>charts</MenuItem>
            <MenuItem href='/pages/widget-examples/gamification'>
              gamification
            </MenuItem>
            <MenuItem href='/pages/widget-examples/actions'>actions</MenuItem>
          </SubMenu>
        </MenuSection>
        <MenuSection label='formsAndTables'>
          <MenuItem href='/forms/form-layouts' icon={<i className='ri-layout-4-line' />}>
            formLayouts
          </MenuItem>
          <MenuItem href='/forms/form-validation' icon={<i className='ri-checkbox-multiple-line' />}>
            formValidation
          </MenuItem>
          <MenuItem href='/forms/form-wizard' icon={<i className='ri-git-commit-line' />}>
            formWizard
          </MenuItem>
          <MenuItem href='/react-table' icon={<i className='ri-table-alt-line' />}>
            reactTable
          </MenuItem>
          <MenuItem
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/form-elements`}
            suffix={<i className='ri-external-link-line text-xl' />}
            target='_blank'
            icon={<i className='ri-radio-button-line' />}
          >
            formELements
          </MenuItem>
          <MenuItem
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/mui-table`}
            suffix={<i className='ri-external-link-line text-xl' />}
            target='_blank'
            icon={<i className='ri-table-2' />}
          >
            muiTables
          </MenuItem>
        </MenuSection>
        <MenuSection label='chartsMisc'>
          <SubMenu label='charts' icon={<i className='ri-bar-chart-2-line' />}>
            <MenuItem href='/charts/apex-charts'>apex</MenuItem>
            <MenuItem href='/charts/recharts'>recharts</MenuItem>
          </SubMenu>
          <MenuItem
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/foundation`}
            suffix={<i className='ri-external-link-line text-xl' />}
            target='_blank'
            icon={<i className='ri-pantone-line' />}
          >
            foundation
          </MenuItem>
          <MenuItem
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/components`}
            suffix={<i className='ri-external-link-line text-xl' />}
            target='_blank'
            icon={<i className='ri-toggle-line' />}
          >
            components
          </MenuItem>
          <MenuItem
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/menu-examples/overview`}
            suffix={<i className='ri-external-link-line text-xl' />}
            target='_blank'
            icon={<i className='ri-menu-search-line' />}
          >
            menuExamples
          </MenuItem>
          <MenuItem
            href='https://pixinvent.ticksy.com'
            suffix={<i className='ri-external-link-line text-xl' />}
            target='_blank'
            icon={<i className='ri-lifebuoy-line' />}
          >
            raiseSupport
          </MenuItem>
          <MenuItem
            href='https://demos.pixinvent.com/materialize-nextjs-admin-template/documentation'
            suffix={<i className='ri-external-link-line text-xl' />}
            target='_blank'
            icon={<i className='ri-book-line' />}
          >
            documentation
          </MenuItem>
          <SubMenu label='others' icon={<i className='ri-more-line' />}>
            <MenuItem suffix={<Chip label='New' size='small' color='info' />}>
              itemWithBadge
            </MenuItem>
            <MenuItem
              href='https://pixinvent.com'
              target='_blank'
              suffix={<i className='ri-external-link-line text-xl' />}
            >
              externalLink
            </MenuItem>
            <SubMenu label='menuLevels'>
              <MenuItem>menuLevel2</MenuItem>
              <SubMenu label='menuLevel2'>
                <MenuItem>menuLevel3</MenuItem>
                <MenuItem>menuLevel3</MenuItem>
              </SubMenu>
            </SubMenu>
            <MenuItem disabled>disabledMenu</MenuItem>
          </SubMenu>
        </MenuSection> */}
      </Menu>
      {/* <Menu
        popoutMenuOffset={{ mainAxis: 17 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <GenerateVerticalMenu menuData={menuData( params)} />
      </Menu> */}
    </ScrollWrapper>
  )
}

export default VerticalMenu
